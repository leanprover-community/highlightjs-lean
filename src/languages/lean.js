/*
Language: Lean
Author: Patrick Massot
Category: scientific
Description: Language definition for Lean theorem prover
*/

module.exports = function(hljs) {
  var COMMON_KEYWORDS =
    'axiom axioms by calc class coinductive constant constants decreasing_by def deriving ' +
    'do else end example export extends forall from fun hiding if import in include inductive ' +
    'infix infixl infixr instance lemma let local match module mutual namespace nonrec notation ' +
    'omit open out parameter parameters partial postfix prefix precedence private protected ' +
    'public renaming section set_option structure termination_by theorem then universe universes ' +
    'unsafe using variable variables where with';

  // Reserved tokens from Lean 4.34.1 (import Lean), plus contextual modifiers.
  var LEAN4_KEYWORDS =
    "abbrev add_decl_doc alias all assert assert! assert_not_exists assert_not_imported attribute " +
    "aux_def bif binder_predicate break builtin_cbv_simproc builtin_cbv_simproc_decl " +
    "builtin_dsimproc builtin_dsimproc_decl builtin_grind_propagator builtin_initialize " +
    "builtin_simproc builtin_simproc_decl by? by_elab catch cbv_eval cbv_simproc " +
    "cbv_simproc_decl coinductive_fixpoint dbg_trace debug_assert! declare_bitwise_int_theorems " +
    "declare_bitwise_uint_theorems declare_command_config_elab " +
    "declare_command_config_elab_legacy declare_config_elab declare_config_elab_legacy " +
    "declare_core_config_elab declare_eval_bin declare_eval_bin_bitwise " +
    "declare_eval_bin_bool_pred declare_int_theorems declare_simp_like_tactic " +
    "declare_sint_simprocs declare_syntax_cat declare_term_config_elab declare_uint_simprocs " +
    "declare_uint_theorems def_eval_config_item deprecated_module deprecated_syntax " +
    "docs_to_verso dsimproc dsimproc_decl elab elab_rules elab_stx_quot ensures eval_prec eval_prio " +
    "exists f! finally for generalizing grind_annotated grind_pattern grind_propagator haveI " +
    "idbg include_str inductive_fixpoint inferInstanceAs init_grind_norm init_quot initialize " +
    "inline invariant leading_parser let_delayed let_expr let_fun let_tmp logNamedError " +
    "logNamedErrorAt logNamedWarning logNamedWarningAt m! macro macro_rules match_expr matches " +
    "max_prec mod_cast monotonicity mut nat_lit no_index nofun nomatch nondep norm_cast_add_elim only opaque " +
    "panic! partial_fixpoint postponeValue println! rec recommended_spelling register_builtin_option " +
    "register_error_explanation register_grind_attr register_label_attr register_linter_set " +
    "register_option register_parser_alias register_simp_attr register_sym_dsimp " +
    "register_sym_simp register_sym_simp_attr register_tactic_tag register_try?_tactic " +
    "reportDbgIssue! reportEMatchIssue! reportIssue! reprove requires return run_elab run_meta s! scoped " +
    "seal set_library_suggestions show_panel_widgets show_term show_term_elab simproc " +
    "simproc_decl structural syntax tactic_alt tactic_extension tactic_name tactic_tag " +
    "termination_by? test_extern throwError throwErrorAt throwNamedError throwNamedErrorAt " +
    "trailing_parser unif_hint unless unlock_limits unreachable! unseal until usedOnly using! while " +
    "with_annotate_term with_weak_namespace without_expected_type";

  // Lean 3 compatibility: commands that are not part of Lean 4.
  var LEAN3_KEYWORDS =
    'abbreviation begin definition exposing hypothesis meta prelude reserve run_cmd theory';

  var COMMON_BUILT_INS =
    'Prop Sort Type assumption at by_cases by_contra by_contradiction cases constructor contradiction ' +
    'dsimp exact exfalso intro intros left letI norm_num obtain propext refine rename revert right ' +
    'rfl ring rw simp simpa split subst symm trans try';

  // Additional built-in tactic, conv, and grind parser heads in Lean 4.34.1.
  var LEAN4_BUILT_INS =
    "StateRefT ac ac_nf ac_nf0 ac_rfl and_intros apply? apply_assumption apply_ext_theorem " +
    "apply_mod_cast apply_rfl apply_rules arg args array_get_dec array_mem_dec as_aux_lemma " +
    "assumption_mod_cast attempt_all attempt_all_par bv_check bv_decide bv_decide? bv_normalize " +
    "bv_omega case case' cases? cases_next cbv change classical clean_wf clear_value conv conv' " +
    "cutsat decide decide_cbv decreasing_tactic decreasing_trivial decreasing_trivial_pre_omega " +
    "decreasing_with deriving_LawfulEq_tactic deriving_LawfulEq_tactic_step " +
    "deriving_ReflEq_tactic dsimp! dsimp? dsimp?! enter eq_refl exact? exact_mod_cast " +
    "expose_names ext ext1 extract_lets fail false_or_by_contra finish? first first_par focus " +
    "fun_cases fun_induction get_elem_tactic get_elem_tactic_extensible get_elem_tactic_trivial " +
    "grind grind? grind_linarith grind_order grobner guard_expr have' impossible infer_instance " +
    "instantiate internalize internalize_all iterate let' let_to_have lhs lia lift_lets linarith " +
    "massumption mbtc mcases mclear mconstructor mdup mexact mexfalso mexists mframe mhave " +
    "mintro mleave mleft mpure mpure_intro mrefine mrename_i mreplace mrevert mright mspec " +
    "mspec_no_bind mspec_no_simp mspecialize mspecialize_pure mstart mstop mvcgen mvcgen? " +
    "mvcgen_trivial mvcgen_trivial_extensible native_decide next norm_cast norm_cast0 omega " +
    "pattern push_cast reduce refine' refine_lift refine_lift' rename_i repeat' repeat1' rfl' " +
    "rhs rintro rotate_left rotate_right run_tac rw? rw_mod_cast set_config show_asserted " +
    "show_cases show_eqcs show_false show_goals show_local_thms show_state show_true simp! simp? " +
    "simp?! simp_all simp_all! simp_all? simp_all?! simp_all_arith simp_all_arith! simp_arith " +
    "simp_arith! simp_match simp_wf simpa! simpa? simpa?! sizeOf_list_dec sleep solve " +
    "solve_by_elim stop subst_eqs subst_vars suggestions sym symm_saturate tactic tactic' trace " +
    "trace_state try? try_suggestions unhygienic use vcgen wait_for_unblock_async whnf " +
    "with_implicit with_reducible with_reducible_and_instances with_unfolding_all " +
    "with_unfolding_none zeta";

  var LEAN4_META =
    "#check #check_assertions #check_failure #check_simp #check_tactic #check_tactic_failure " +
    "#discr_tree_key #discr_tree_simp_key #dump_async_env_state #eval #eval! #exit #grind_lint " +
    "#guard #guard_expr #guard_msgs #guard_panic #import_path #info_trees #print #reduce " +
    "#show_deprecated_modules #synth #time #version #where #widget #with_exporting";

  // Tokens whose final punctuation is part of Lean syntax.
  var LEAN4_PERCENT_KEYWORDS =
    "binop% binop_lazy% binrel% binrel_no_prop% builtin_cbv_simproc_pattern% " +
    "builtin_simproc_pattern% cbv_simproc_pattern% clear% decl_name% default_or_ofNonempty% " +
    "elabToSyntax% ensure_expected_type% ensure_type_of% exact?% for_in% for_in'% " +
    "gen_injective_theorems% json% leftact% let_mvar% no_error_if_unused% no_implicit_lambda% " +
    "private_decl% reset_grind_attrs% rightact% satisfies_binder_pred% simproc_pattern% " +
    "struct_inst_default% type_of% unop% value_of% wait_for_expected_type% " +
    "wait_if_contains_mvar% wait_if_type_contains_mvar% wait_if_type_mvar% with_decl_name%";

  // Lean 3 compatibility: tactics and commands mostly seen in Lean 3 code.
  var LEAN3_BUILT_INS =
    'abstract ac_refl ac_reflexivity all_goals any_goals apply apply_instance apply_with assume ' +
    'cc clear congr congr_arg congr_n continue delta destruct done dunfold eapply econstructor ' +
    'erw exacts existsi fail_if_success fapply finish funext generalize guard_hyp guard_target ' +
    'have induction injection injections introv left right rcases refl repeat replace rewrite rwa ' +
    'show simp_intros skip solve1 specialize substs success_if_fail suffices swap symmetry ' +
    'transitivity trivial unfold unfold1 unfold_coes unfold_projs';

  // Use Lean's letter-like ranges, excluding operators such as λ, Π, Σ, ×, and ÷.
  // See isLetterLike/isIdRest in Lean's src/Init/Meta/Defs.lean.
  var LEAN_IDENT_START = /[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u017F\u0391-\u039F\u03A1-\u03A2\u03A4-\u03A9\u03B1-\u03BA\u03BC-\u03FB\u1F00-\u1FFE\u2100-\u214F]/u.source.slice(0, -1);
  // Spell out the supplementary range: Highlight.js also parses regexes without
  // the Unicode flag when counting groups, so a code-point range would fail there.
  for (var codePoint = 0x1D49C; codePoint <= 0x1D59F; codePoint++) {
    LEAN_IDENT_START += String.fromCodePoint(codePoint);
  }
  LEAN_IDENT_START += ']';
  // Keep the legacy superscript continuations accepted by the Lean 3 grammar.
  var LEAN_IDENT_CONTINUE = LEAN_IDENT_START.slice(0, -1) + /[0-9!?'\u2079\u207F\u2080-\u2089\u2090-\u209C\u1D62-\u1D6A\u2C7C]/u.source.slice(1);
  var LEAN_IDENT_RE = new RegExp('(?:' + LEAN_IDENT_START + LEAN_IDENT_CONTINUE + '*|«[^»\\n]+»)', 'u');
  var LEAN_NAME_RE = new RegExp(LEAN_IDENT_RE.source + '(?:\\.' + LEAN_IDENT_RE.source + ')*', 'u');
  function escapeRegex(word) {
    return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function keywordBegin(words) {
    return new RegExp('(?<!' + LEAN_IDENT_CONTINUE + '|\\.)(?:' + words.split(' ').map(escapeRegex).join('|') +
      ')(?!' + LEAN_IDENT_CONTINUE + '|\\.)', 'u');
  }

  var LEAN_KEYWORDS = {
    $pattern: new RegExp('#?' + LEAN_NAME_RE.source + '|λ|∀|Π|∃|⨁|:=?|=>', 'u'),
    keyword:
      COMMON_KEYWORDS + ' ' + LEAN4_KEYWORDS + ' ' + LEAN3_KEYWORDS,
    built_in:
      COMMON_BUILT_INS + ' ' + LEAN4_BUILT_INS + ' ' + LEAN3_BUILT_INS,
    literal:
      'false true tt ff',
    meta:
      LEAN4_META + ' #help noncomputable',
    section:
      'section namespace end',
    sorry:
      'sorry admit',
    symbol:
      'λ ∀ ∃ Π ⨁ := _'
  };

  // Consume whole names so that a keyword or numeral inside one is not a token.
  var LEAN_IDENTIFIER = {
    begin: new RegExp('#?' + LEAN_NAME_RE.source, 'u'),
    keywords: LEAN_KEYWORDS,
    relevance: 0
  };

  var LEAN_NUMBER = {
    className: 'number',
    variants: [
      { begin: /0x[0-9A-Fa-f]+/ },
      { begin: /0b[01]+/ }
    ]
  };

  var LEAN_CHAR = {
    className: 'string',
    begin: /'(?:\\[\\"'0abfnrtv]|\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|[^'\\])'/
  };

  var LEAN_RAW_STRING = {
    className: 'string',
    // A backreference consumes exactly the opening hash count, leaving any
    // subsequent hashes outside the string. An unfinished literal extends to EOF.
    begin: /r(#*)"[\s\S]*?(?:"\1|(?![\s\S]))/
  };

  var QUOTED_SYMBOL = {
    className: 'symbol',
    begin: /``?[^ \t\n\r()[\]{}:,;]+/,
    relevance: 0
  };

  var GUILLEMET_IDENTIFIER = {
    className: 'title',
    begin: /«[^»\n]+»/u,
    relevance: 0
  };

  var DASH_COMMENT = hljs.COMMENT('--', '$');
  var MULTI_LINE_COMMENT = hljs.COMMENT(/\/-/, /-\//, {
    contains: ['self']
  });
  var DOC_COMMENT = {
    className: 'doctag',
    begin: /\/-[-!]/,
    end: /-\//,
    contains: [MULTI_LINE_COMMENT]
  };

  var LEAN_LEXICAL_MODES = [
    LEAN_RAW_STRING,
    hljs.QUOTE_STRING_MODE,
    LEAN_CHAR,
    LEAN_NUMBER,
    hljs.NUMBER_MODE,
    DASH_COMMENT,
    DOC_COMMENT,
    MULTI_LINE_COMMENT,
    QUOTED_SYMBOL,
    GUILLEMET_IDENTIFIER,
    {
      className: 'keyword',
      // These reserved tokens end with punctuation, so a following identifier
      // starts a new token even without whitespace (e.g. decl_name%x).
      begin: new RegExp('(?<!' + LEAN_IDENT_CONTINUE + '|\\.)(?:' +
        LEAN4_PERCENT_KEYWORDS.split(' ').map(escapeRegex).join('|') + '|let_λ)', 'u'),
      relevance: 0
    },
    {
      className: 'keyword',
      // Leave the opening bracket for parameter modes to balance normally.
      begin: new RegExp(keywordBegin('date datespec datetime offset sepBy sepBy1 time timezone unicode zoned').source + '(?=\\()', 'u'),
      relevance: 0
    },
    {
      className: 'keyword',
      begin: new RegExp(keywordBegin('trace trace_goal Macro.trace').source + '(?=\\[)|' +
        keywordBegin('EPost epost').source + '(?=⟨)', 'u'),
      relevance: 0
    },
    {
      className: 'meta',
      begin: /#v(?=\[)/,
      relevance: 0
    }
  ];

  // Each variant closes only on its matching bracket; all three may nest.
  var LEAN_PARAMS = {
    className: 'params',
    variants: [
      { begin: /\(/, end: /\)/ },
      { begin: /\[/, end: /\]/ },
      { begin: /\{/, end: /\}/ }
    ],
    keywords: LEAN_KEYWORDS,
    contains: LEAN_LEXICAL_MODES.concat([LEAN_IDENTIFIER]),
    relevance: 0
  };
  LEAN_PARAMS.contains.push(LEAN_PARAMS);

  var ATTRIBUTE_DECORATOR = {
    className: 'meta',
    begin: '@\\[',
    end: '\\]'
  };

  var ATTRIBUTE_LINE = {
    className: 'meta',
    begin: '^attribute',
    end: '$'
  };

  var LEAN_DEFINITION = {
    className: 'theorem',
    begin: keywordBegin('abbrev abbreviation axiom class coinductive constant def definition elab example inductive instance lemma macro opaque structure syntax theorem'),
    end: /(:=|=>|:)/,
    excludeEnd: true,
    contains: LEAN_LEXICAL_MODES.concat([
      {
        className: 'keyword',
        begin: keywordBegin('extends')
      },
      {
        className: 'keyword',
        begin: keywordBegin('where'),
        endsParent: true
      },
      hljs.inherit(hljs.TITLE_MODE, {
        begin: LEAN_NAME_RE
      }),
      LEAN_PARAMS,
      {
        className: 'symbol',
        begin: /:=|=>|:/,
        endsParent: true
      },
    ]),
    keywords: LEAN_KEYWORDS,
    relevance: 0
  };

  var LEAN_FIELD_DECLARATION = {
    className: 'title',
    // Indentation must not scan through subsequent lines.
    begin: new RegExp('^[ \\t]*(?!(?:by|do|elab_rules|for|from|have|if|let|letI|match|return|show|suffices)(?!' +
      LEAN_IDENT_CONTINUE + '))' + LEAN_IDENT_RE.source + '(?=[ \\t]*:)', 'u'),
    relevance: 0
  };

  var LEAN_CONSTRUCTOR_DECLARATION = {
    className: 'title',
    begin: new RegExp('^[ \\t]*\\|[ \\t]*' + LEAN_IDENT_RE.source, 'u'),
    relevance: 0
  };

  return {
    name: "lean",
    unicodeRegex: true,
    keywords: LEAN_KEYWORDS,
    contains: LEAN_LEXICAL_MODES.concat([
      LEAN_DEFINITION,
      LEAN_FIELD_DECLARATION,
      LEAN_CONSTRUCTOR_DECLARATION,
      ATTRIBUTE_DECORATOR,
      ATTRIBUTE_LINE,
      LEAN_IDENTIFIER,
      { begin: /⟨/ } // relevance booster
    ])
  };
}
