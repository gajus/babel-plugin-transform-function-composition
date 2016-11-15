export default function ({
  types: t
}) {
  return {

    // eslint-disable-next-line global-require
    inherits: require('babel-plugin-syntax-function-bind'),
    visitor: {
      CallExpression ({
        node
      }) {
        const bind = node.callee;

        if (!t.isBindExpression(bind)) {
          return;
        }

        const context = bind.object;

        node.callee = bind.callee;

        node.arguments.push(context);
      }
    }
  };
}
