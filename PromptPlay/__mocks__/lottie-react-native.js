const React = require('react')
const { View } = require('react-native')

const LottieView = React.forwardRef((props, ref) =>
  React.createElement(View, { testID: 'lottie-view', ...props, ref })
)
LottieView.displayName = 'LottieView'

module.exports = LottieView
module.exports.default = LottieView
