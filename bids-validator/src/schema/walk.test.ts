import { assert, assertEquals } from '../deps/asserts.ts'
import { BIDSContext, BIDSContextDataset } from './context.ts'
import { walkFileTree } from './walk.ts'
import { DatasetIssues } from '../issues/datasetIssues.ts'
import { simpleDataset, simpleDatasetFileCount } from '../tests/simple-dataset.ts'

Deno.test('file tree walking', async (t) => {
  await t.step('visits each file and creates a BIDSContext', async () => {
    const dsContext = new BIDSContextDataset(undefined, undefined, simpleDataset)
    for await (const context of walkFileTree(dsContext)) {
      assert(
        context instanceof BIDSContext,
        'walk file tree did not return a BIDSContext',
      )
    }
  })
  await t.step('visits every file expected', async () => {
    const dsContext = new BIDSContextDataset(undefined, undefined, simpleDataset)
    let accumulator = 0
    for await (const context of walkFileTree(dsContext)) {
      assert(
        context instanceof BIDSContext,
        'walk file tree did not return a BIDSContext',
      )
      accumulator = accumulator + 1
    }
    assertEquals(
      accumulator,
      simpleDatasetFileCount,
      'visited file count does not match expected value',
    )
  })
})
