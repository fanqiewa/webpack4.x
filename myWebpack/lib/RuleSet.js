/**
 * 规则设置
 */
"use strict";

module.exports = class RuleSet {
  constructor(rules) {
    this.references = Object.create(null);
    this.rules = RuleSet.normalizeRules(rules, this.references, "ref-");
  }

  // 格式化规则
  static normalizeRules(rules, refs, ident) {
    if (Array.isArray(rules)) {
      return rules.map((rule, idx) => {
        return RuleSet.normalizeRule(rule, refs, `${ident}-${idx}`);
      })
    } else if (rules) {
      return [RuleSet.normalizeRule(rules, refs, ident)];
    } else {
      return [];
    }
  }

  static normalizeRule(rule, refs, ident) {
    if (typeof rule === "string") {
      return {
        use: [
          {
            loader: rule
          }
        ]
      };
    }
    if (!rule) {
      throw new Error("Unexcepted null when object was expected as rule");
    }

    if (typeof rule !== "object") {
      throw new Error(
        "Unexcepted " +
          typeof rule +
          " when object was expected as rule (" +
          rule +
          ")"
      );
    }

    const newRule = {};
    let useSource;
    let resourceSource;
    let condition;

    const checkUseSource = newSource => {
      // TODO
    }

    const checkResourceSource = newSource => {
      if (resourceSource && resourceSource !== newSource) {
        throw new Error(
          RuleSet.buildErrorMessage(
            rule,
            new Error(
              "Rule can only have one resource source (provided " +
                newSource +
                " and " +
                resourceSource +
                ")"
            )
          )
        )
      }
      resourceSource = newSource;
    }

    if (rule.test || rule.include || rule.exclude) {
      checkResourceSource("test + include + exclude");
      condition = {
        test: rule.test,
        include: rule.include,
        exclude: rule.exclude
      };
      try {
        newRule.resource = RuleSet.normalizeCondition(condition);
      } catch (error) {
        throw new Error(RuleSet.buildErrorMessage(condition, error));
      }
    }

    if (rule.resource) {
      // TODO
    }

    if (rule.realResource) {
      // TODO
    }

    if (rule.resourceQuery) {
      // TODO
    }

    if (rule.compiler) {
      // TODO
    }

    if (rule.issuer) {
      // TODO
    }

    if (rule.loader && rule.loaders) {
      // TODO
    }

    const loader = rule.loaders || rule.loader;
    if (typeof loader === "string" && !rule.options && !rule.query) {
      // TODO
    } else if (typeof loader === "string" && (rule.options || rule.query)) {
      // TODO
    } else if (typeof loader && (rule.options || rule.query)) {
      // TODO
    } else if (loader) {
      // TODO
    } else if (rule.options || rule.query) {
      // TODO
    }

    if (rule.use) {
      // TODO
    }

    if (rule.rules) {
      // TODO
    }

    if (rule.oneOf) {
      // TODO
    }

    const keys = Object.keys(rule).filter(key => {
      return ![
        "resource",
        "resourceQuery",
        "compiler",
        "test",
        "include",
        "exclude",
        "issuer",
        "options",
        "query",
        "loaders",
        "use",
        "rules",
        "oneOf"
      ].includes(key);
    });
    for (const key of keys) {
      newRule[key] = rule[key];
    }

    if (Array.isArray(newRule.use)) {
      // TODO
    }
    
    return newRule;
  }

  // 格式化条件
  static normalizeCondition(condition) {
    if (!condition) throw new Error("Expected condition but got falsy value");
    if (typeof condition === "string") {
      // TODO
    }
    if (typeof condition === "function") {
      // TODO
    }
    if (condition instanceof RegExp) {
      return condition.test.bind(condition);
    }
    if (Array.isArray(condition)) {
      // TODO
    }
    if (typeof condition !== "object") {
      // TODO
    }

    const matchers = [];
    Object.keys(condition).forEach(key => {
      const value = condition[key];
      switch (key) {
        case "or":
        case "include":
        case "test":
          if (value) matchers.push(RuleSet.normalizeCondition(value));
          break;
        case "and":
          // TODO
          break;
        case "not":
        case "exclude":
          if (value) {
            // TODO
          }
          break;
        default:
          throw new Error("Unexcepted property " + key + " in condition");
      }
    });
    if (matchers.length === 0) {
      throw new Error("Excepted condition but got " + condition);
    }
    if (matchers.length === 1) {
      return matchers[0];
    }
    return andMatcher(matchers);
  }

  // exec
  exec(data) {
    const result = [];
    this._run(
      data,
      {
        rules: this.rules
      },
      result
    );
    return result;
  }

  _run(data, rule, result) {
		if (rule.resource && !data.resource) return false;
		if (rule.realResource && !data.realResource) return false;
		if (rule.resourceQuery && !data.resourceQuery) return false;
		if (rule.compiler && !data.compiler) return false;
		if (rule.issuer && !data.issuer) return false;
		if (rule.resource && !rule.resource(data.resource)) return false;
		if (rule.realResource && !rule.realResource(data.realResource))
      return false;
		if (data.issuer && rule.issuer && !rule.issuer(data.issuer)) return false;
		if (
			data.resourceQuery &&
			rule.resourceQuery &&
			!rule.resourceQuery(data.resourceQuery)
		) {
			return false;
		}
		if (data.compiler && rule.compiler && !rule.compiler(data.compiler)) {
			return false;
		}

		const keys = Object.keys(rule).filter(key => {
			return ![
				"resource",
				"realResource",
				"resourceQuery",
				"compiler",
				"issuer",
				"rules",
				"oneOf",
				"use",
				"enforce"
			].includes(key);
		});
		for (const key of keys) {
			result.push({
				type: key,
				value: rule[key]
			});
		}

    if (rule.use) {
      // TODO
    }

    if (rule.rules) {
			for (let i = 0; i < rule.rules.length; i++) {
				this._run(data, rule.rules[i], result);
			}
    }
    
		if (rule.oneOf) {
			// TODO
		}
    
		return true;
  }
}