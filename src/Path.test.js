import Path from './Path';

it('Path construction works for 0.contains.0', () => {
  var path = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path._asArray()).toEqual([0, 'contains', 0]);
});

it('Path removeLast', () => {
  var path = new Path().setIndex(0).add(['contains']).setIndex(0).removeLast();
  expect(path._asArray()).toEqual([0]);
});