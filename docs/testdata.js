export let testdata = [
{
    id: "A",
    title: "A",
    contains: [
        {
        id: "A1",
        title: "A1",
        allowMultiRow: false,
        allowSibling: function ({parent}) { console.log(parent); return !parent; },
        },
        {
            if: "AAA",
            multi: [
                {
                id: "A2",
                title: "A2",
                },
                {
                id: "A3",
                title: "A3",
                },
            ]
        }
    ]
},
{
    id: "B",
    title: "B",
    multi: [
      { id: "BA1", title: "BA1" },
      { id: "BA2", title: "BA2" }
    ],
    contains: [
        {
        id: "B1",
        title: "B1",
        multi: [
          { id: "B1A1", title: "B1A1" }
        ],
        },
        {
        id: "B2",
        title: "B2",
        },
    ],
    "contains-group1": [
      { id: "B1A1", title: "B1A1" }
    ]
},
{
    id: "C",
    title: "C",
    contains: [
        {
        id: "C1",
        title: "C1",
        contains: [
            {
                id: "C1x",
                title: "C1x",
            },
            {
                id: "C1y",
                title: "C1y",
            },
            {
                id: "C1z",
                title: "C1z",
            },
            {
                id: "C1zz",
                title: "C1zz",
            },
            {
                id: "C1zzz",
                title: "C1zzz",
            },
        ]
        },
    ]
}
];
