Not used yet. The app currently runs `@tensorflow-models/mobilenet`, a
pretrained general-purpose classifier fetched from its default CDN — it
only recognizes the ~10 fruits present in ImageNet-1k (see
`src/lib/inference.ts`) and misses most others (mango, watermelon, grapes,
pears, etc.).

Drop a fine-tuned fruit-specific TensorFlow.js `LayersModel` here
(`model.json` + weight shards) when one's trained/sourced, and point
`src/lib/model.ts` at it instead of MobileNet.
