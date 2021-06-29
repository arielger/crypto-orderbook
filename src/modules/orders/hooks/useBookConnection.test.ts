const { handleDeltas, processOrdersOutput } = require("./useBookConnection");

describe("handleDeltas util function", () => {
  test("should remove price level if price is 0", () => {
    expect(
      handleDeltas(
        {
          asks: {
            47341: 2300,
            47340.5: 500,
            47339.5: 500,
          },
          bids: {},
        },
        [[47340.5, 0]],
        []
      )
    ).toEqual({
      asks: {
        47341: 2300,
        47339.5: 500,
      },
      bids: {},
    });
  });

  test("should update price level with new size", () => {
    expect(
      handleDeltas(
        {
          asks: {
            47341: 2300,
            47340.5: 500,
            47339.5: 500,
          },
          bids: {},
        },
        [[47340.5, 1000]],
        []
      )
    ).toEqual({
      asks: {
        47341: 2300,
        47340.5: 1000,
        47339.5: 500,
      },
      bids: {},
    });
  });
});

describe("processOrdersOutput util function", () => {
  test("should group orders by 0.5 #1", () => {
    expect(
      processOrdersOutput(
        {
          10: 500,
          10.25: 250,
        },
        0.5
      )
    ).toEqual([[10, 750]]);
  });

  test("should group orders by 0.5 #2", () => {
    expect(
      processOrdersOutput(
        {
          10: 500,
          10.25: 250,
          10.49: 250,
          10.6: 300,
          10.9: 1500,
          11: 100,
        },
        0.5
      )
    ).toEqual([
      [10, 1000],
      [10.5, 1800],
      [11, 100],
    ]);
  });

  test("should group orders by 2.5", () => {
    expect(
      processOrdersOutput(
        {
          10: 500,
          10.25: 250,
          11.5: 250,
          13.8: 300,
          14.99: 1500,
          17: 100,
        },
        2.5
      )
    ).toEqual([
      [10, 1000],
      [12.5, 1800],
      [15, 100],
    ]);
  });
});
