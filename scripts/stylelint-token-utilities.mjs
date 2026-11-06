import stylelint from 'stylelint';

const ruleName = 'cyberui/token-utilities';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: utility => `Use a cyber spacing token instead of a covered pixel value in "${utility}"`,
});

export default stylelint.createPlugin(ruleName, enabled => (root, result) => {
  if (!enabled) return;
  root.walkAtRules('apply', rule => {
    for (const utility of rule.params.split(/\s+/)) {
      const spacing = utility.match(/(?:^|:)-?(?:p[trblxy]?|m[trblxy]?|gap(?:-[xy])?)-\[([^\]]+)\]!?$/);
      if (!spacing || !/(?<![\w.])-?(4|6|10|14|18|24|32|48|64)px\b/.test(spacing[1].replaceAll('_', ' '))) continue;
      stylelint.utils.report({ ruleName, result, node: rule, message: messages.expected(utility) });
    }
  });
});
