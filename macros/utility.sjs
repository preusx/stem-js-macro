/**
 * Get braced body lines as $someVar$body.
 */
macroclass $blockBody {
  pattern {
    rule { { $body ... } }
  }
}
export $blockBody