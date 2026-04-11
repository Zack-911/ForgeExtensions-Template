import { generateMetadata } from '@tryforge/forgescript'

generateMetadata(
  `${__dirname}/functions`,
  'functions',
  'MyExtensionEvents',
  false,
  undefined,
  `${__dirname}/events`,
)