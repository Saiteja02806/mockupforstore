import test from 'node:test'
import assert from 'node:assert/strict'
import { collectHitLayerIdsFrontFirst, cyclePickInHits } from './storeEditorLayerCycle.js'

test('collectHitLayerIdsFrontFirst returns top-of-stack first', () => {
  const stack = [
    { id: 'a', z: 0 },
    { id: 'b', z: 1 },
    { id: 'c', z: 2 },
  ]
  const hits = collectHitLayerIdsFrontFirst(stack, (l) => ['b', 'c'].includes(l.id))
  assert.deepEqual(hits, ['c', 'b'])
})

test('cyclePickInHits advances in hit list', () => {
  assert.equal(cyclePickInHits('c', ['c', 'b', 'a']), 'b')
  assert.equal(cyclePickInHits('b', ['c', 'b', 'a']), 'a')
  assert.equal(cyclePickInHits('a', ['c', 'b', 'a']), 'c')
})

test('cyclePickInHits picks first when current not in list', () => {
  assert.equal(cyclePickInHits('x', ['c', 'b']), 'c')
})

test('cyclePickInHits single hit', () => {
  assert.equal(cyclePickInHits('c', ['c']), 'c')
})
