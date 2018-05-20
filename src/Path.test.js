import Path from './Path';

it('Path construction works for 0.contains.0', () => {
  var path = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path._asArray()).toEqual([0, 'contains', 0]);
});

it('Path removeLast', () => {
  var path = new Path().setIndex(0).add(['contains']).setIndex(0).removeLast();
  expect(path._asArray()).toEqual([0]);
});

it('Path equals', () => {
  var path1 = new Path().setIndex(0).add(['contains']).setIndex(0);
  var path2 = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path1.equals(path2)).toBeTruthy();
});

it('Path unequals 1', () => {
  var path1 = new Path().setIndex(1).add(['contains']).setIndex(0);
  var path2 = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path1.equals(path2)).toBeFalsy();
});

it('Path unequals 2', () => {
  var path1 = new Path().setIndex(0).add(['contains']).setIndex(0).add(['contains']);
  var path2 = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path1.equals(path2)).toBeFalsy();
});

it('Path unequals 3', () => {
  var path1 = new Path().setIndex(0);
  var path2 = new Path().setIndex(0).add(['contains']).setIndex(0);
  expect(path1.equals(path2)).toBeFalsy();
});