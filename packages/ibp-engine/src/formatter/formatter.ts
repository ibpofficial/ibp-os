import { parse } from '../parser/parser';
import {
  ProgramNode,
  Statement,
  Expression,
  BlockStmt,
} from '../types/ast';

export function formatIBP(source: string): string {
  try {
    const { program, errors } = parse(source);
    if (errors.length > 0) {
      // If there are syntax errors, fall back to line-based indentation cleanup
      return fallbackFormat(source);
    }
    return formatProgram(program);
  } catch {
    return fallbackFormat(source);
  }
}

function formatProgram(program: ProgramNode): string {
  return program.body.map((stmt) => formatStatement(stmt, 0)).join('\n');
}

function indent(depth: number): string {
  return '  '.repeat(depth);
}

function formatStatement(stmt: Statement, depth: number): string {
  const p = indent(depth);

  switch (stmt.type) {
    case 'VarDeclStmt':
      return `${p}keep ${stmt.name}${stmt.init ? ` = ${formatExpression(stmt.init)}` : ''}`;
    case 'ConstDeclStmt':
      return `${p}lock ${stmt.name} = ${formatExpression(stmt.init)}`;
    case 'AssignStmt':
      return `${p}${formatExpression(stmt.target)} = ${formatExpression(stmt.value)}`;
    case 'OutputStmt':
      return `${p}${stmt.mode} ${formatExpression(stmt.value)}`;
    case 'InputStmt':
      return `${p}ask ${stmt.isNumber ? 'number ' : ''}${formatExpression(stmt.prompt)} into ${stmt.target}`;
    case 'WhenStmt': {
      let result = `${p}when ${formatExpression(stmt.condition)} ${formatBlock(stmt.body, depth)}`;
      for (const branch of stmt.orwhenBranches) {
        result += ` orwhen ${formatExpression(branch.condition)} ${formatBlock(branch.body, depth)}`;
      }
      if (stmt.otherwiseBranch) {
        result += ` otherwise ${formatBlock(stmt.otherwiseBranch, depth)}`;
      }
      return result;
    }
    case 'UnlessStmt':
      return `${p}unless ${formatExpression(stmt.condition)} ${formatBlock(stmt.body, depth)}`;
    case 'RepeatStmt':
      return `${p}repeat ${formatExpression(stmt.count)} times ${formatBlock(stmt.body, depth)}`;
    case 'CountStmt':
      return `${p}count ${stmt.variable} from ${formatExpression(stmt.from)} to ${formatExpression(stmt.to)}${
        stmt.step ? ` step ${formatExpression(stmt.step)}` : ''
      } ${formatBlock(stmt.body, depth)}`;
    case 'EachStmt':
      return `${p}each ${stmt.variable} in ${formatExpression(stmt.collection)} ${formatBlock(stmt.body, depth)}`;
    case 'WhileStmt':
      return `${p}while ${formatExpression(stmt.condition)} ${formatBlock(stmt.body, depth)}`;
    case 'ForeverStmt':
      return `${p}forever ${formatBlock(stmt.body, depth)}`;
    case 'RecipeDeclStmt': {
      const params = stmt.params
        .map((pr) => `${pr.name}${pr.defaultValue ? ` = ${formatExpression(pr.defaultValue)}` : ''}`)
        .join(', ');
      if (stmt.isArrow) {
        return `${p}recipe ${stmt.name}(${params}) => ${formatExpression(stmt.body as Expression)}`;
      }
      return `${p}recipe ${stmt.name}(${params}) ${formatBlock(stmt.body as BlockStmt, depth)}`;
    }
    case 'BoxDeclStmt': {
      if (stmt.entries.length === 0) {
        return `${p}box ${stmt.name} {}`;
      }
      const entries = stmt.entries
        .map((e) => `${indent(depth + 1)}${e.key}: ${formatExpression(e.value)}`)
        .join(',\n');
      return `${p}box ${stmt.name} {\n${entries}\n${p}}`;
    }
    case 'AddStmt':
      return `${p}add ${formatExpression(stmt.item)} to ${stmt.target}`;
    case 'RemoveStmt':
      return `${p}remove ${formatExpression(stmt.item)} from ${stmt.target}`;
    case 'AttemptStmt': {
      let res = `${p}attempt ${formatBlock(stmt.attemptBody, depth)} rescue ${stmt.errorVar} ${formatBlock(
        stmt.rescueBody,
        depth
      )}`;
      if (stmt.alwaysBody) {
        res += ` always ${formatBlock(stmt.alwaysBody, depth)}`;
      }
      return res;
    }
    case 'RaiseStmt':
      return `${p}raise ${formatExpression(stmt.value)}`;
    case 'ExpectStmt':
      return `${p}expect ${stmt.label ? `"${stmt.label}": ` : ''}${formatExpression(stmt.expression)}`;
    case 'WaitStmt':
      return `${p}wait ${formatExpression(stmt.duration)} seconds`;
    case 'RememberStmt':
      return `${p}remember ${formatExpression(stmt.key)} = ${formatExpression(stmt.value)}`;
    case 'CelebrateStmt':
      return `${p}celebrate`;
    case 'TodoStmt':
      return `${p}todo "${stmt.text}"`;
    case 'SeedStmt':
      return `${p}seed ${formatExpression(stmt.seed)}`;
    case 'StopStmt':
      return `${p}stop`;
    case 'SkipStmt':
      return `${p}skip`;
    case 'GiveStmt':
      return `${p}give${stmt.value ? ` ${formatExpression(stmt.value)}` : ''}`;
    case 'ExprStmt':
      return `${p}${formatExpression(stmt.expression)}`;
    case 'BlockStmt':
      return formatBlock(stmt, depth);
  }
}

function formatBlock(block: BlockStmt, depth: number): string {
  if (block.body.length === 0) return '{}';
  const inner = block.body.map((s) => formatStatement(s, depth + 1)).join('\n');
  return `{\n${inner}\n${indent(depth)}}`;
}

function formatExpression(expr: Expression): string {
  switch (expr.type) {
    case 'NumberLiteral':
      return String(expr.value);
    case 'StringLiteral':
      return `"${expr.value.replace(/"/g, '\\"')}"`;
    case 'InterpolatedStringExpr': {
      let str = '"';
      for (const part of expr.parts) {
        if (part.type === 'text') str += part.value;
        else str += `{${formatExpression(part.value)}}`;
      }
      str += '"';
      return str;
    }
    case 'BooleanLiteral':
      return expr.value ? 'yes' : 'no';
    case 'EmptyLiteral':
      return 'empty';
    case 'IdentifierExpr':
      return expr.name;
    case 'ListLiteral':
      return `[${expr.elements.map(formatExpression).join(', ')}]`;
    case 'BoxLiteral': {
      if (expr.entries.length === 0) return 'box {}';
      const entries = expr.entries.map((e) => `${e.key}: ${formatExpression(e.value)}`).join(', ');
      return `box { ${entries} }`;
    }
    case 'BinaryExpr':
      return `${formatExpression(expr.left)} ${expr.operator} ${formatExpression(expr.right)}`;
    case 'UnaryExpr':
      return `${expr.operator === 'not' ? 'not ' : expr.operator}${formatExpression(expr.operand)}`;
    case 'PipeExpr':
      return `${formatExpression(expr.left)} |> ${formatExpression(expr.right)}`;
    case 'RangeExpr':
      return `${formatExpression(expr.start)}..${formatExpression(expr.end)}`;
    case 'CallExpr':
      return `${formatExpression(expr.callee)}(${expr.arguments.map(formatExpression).join(', ')})`;
    case 'IndexExpr':
      return `${formatExpression(expr.target)}[${formatExpression(expr.index)}]`;
    case 'MemberExpr':
      return `${formatExpression(expr.target)}${expr.isSafe ? '?.' : '.'}${expr.property}`;
  }
}

function fallbackFormat(source: string): string {
  const lines = source.split('\n');
  let depth = 0;
  const result: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      result.push('');
      continue;
    }

    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      depth = Math.max(0, depth - 1);
    }

    result.push(`${indent(depth)}${trimmed}`);

    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      depth++;
    }
  }

  return result.join('\n');
}

