/-
Reference vocabulary from Lean's parser tables, independent of the highlighter.
Regenerate with Lean 4.34.1:
  lean test/lean4-keywords.lean > test/lean4-keywords.json
The JSON can be reformatted without changing its contents.
-/
import Lean

open Lean Elab Command

private def isLetter (c : Char) : Bool :=
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'

private def isWordlike (token : String) : Bool := Id.run do
  let chars := token.toList
  let chars := if chars.head? == some '#' then chars.drop 1 else chars
  return chars.head?.any isLetter && chars.all fun c =>
    isLetter c || (c >= '0' && c <= '9') || "!?'".contains c

private def strings (tokens : Array String) : Json :=
  Json.arr (tokens.qsort (· < ·) |>.map Json.str)

run_cmd do
  let env ← getEnv
  let tokens := (Parser.Module.updateTokens (Parser.getTokenTable env)).values
  let reserved := tokens.filter isWordlike
  let mut parserHeads : Array String := #[]
  let categories := (Parser.parserExtension.getState env).categories.toList
  for (name, cat) in categories do
    if ["command", "term", "doElem", "tactic", "conv", "grind"].contains name.toString then
      for table in [cat.tables.leadingTable, cat.tables.trailingTable] do
        for (token, _) in table do
          let word := token.toString
          if isWordlike word && !reserved.contains word && !parserHeads.contains word &&
              !["ident", "num", "scientific", "str", "char", "name"].contains word then
            parserHeads := parserHeads.push word
  let percentTokens := tokens.filter fun token =>
    token.endsWith "%" && isWordlike (token.dropEnd 1).toString
  -- Word-bearing tokens with a delimiter, excluding syntax quotation openers.
  let compoundTokens := tokens.filter fun token =>
    token == "let_λ" ||
    (["(", "[", "⟨"].any (fun suffix => token.endsWith suffix) &&
      ((token.dropEnd 1).toString.toList.any fun c => c >= 'a' && c <= 'z'))
  liftIO <| IO.println <| (Json.mkObj [
    ("version", Json.str Lean.versionString),
    ("reserved", strings reserved),
    ("parserHeads", strings parserHeads),
    ("percentTokens", strings percentTokens),
    ("compoundTokens", strings compoundTokens)
  ]).compress
