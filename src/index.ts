import { LadcModifier, MainConnection, TransactionConnection } from "ladc"
import { Statement as SqlBricksQuery } from "sql-bricks"
import { WithSqlBricksOptions } from "./exported-definitions"

export default function sqlBricksModifier(options: WithSqlBricksOptions = {}): LadcModifier {
  return {
    modifyConnection: cn => modifyConnection(cn, options)
  }
}

const methodNames = ["prepare", "exec", "all", "singleRow", "singleValue", "cursor"]

function modifyConnection(parent: TransactionConnection | MainConnection, options: WithSqlBricksOptions) {
  let modified = Object.create(parent)

  for (let method of methodNames) {
    modified[method] = (sql: string | SqlBricksQuery, params?) => {
      if (typeof sql === "string")
        return parent[method](sql, params)
      if (options.trace)
        options.trace(method, sql)
      let { text, values } = sql.toParams(options.toParamsOptions as any)
      return parent[method](text, values)
    }
  }

  return modified
}