const { handleDeltas } = require("./useBookConnection");

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
