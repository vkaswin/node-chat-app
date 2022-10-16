const mongoose = require("mongoose");

const messageScheme = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    msg: {
      type: String,
    },
    date: {
      type: Date,
    },
    seen: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
          },
          date: {
            type: mongoose.Schema.Types.Date,
          },
        },
      ],
      default: [],
      _id: false,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    reactions: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
          },
          date: {
            type: mongoose.Schema.Types.Date,
          },
          reaction: {
            type: mongoose.Schema.Types.String,
          },
        },
      ],
      default: [],
      _id: false,
    },
    overallReactions: {
      type: [mongoose.Schema.Types.String],
      default: [],
    },
  },
  { timestamps: true }
);

messageScheme.statics.query = function (totalUsers) {
  return [
    {
      $lookup: {
        from: "messages",
        localField: "reply",
        foreignField: "_id",
        as: "reply",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              id: "$_id",
              _id: 0,
              name: 1,
              avatar: 1,
              status: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        day: {
          $dateToString: {
            date: "$date",
            format: "%Y-%m-%d",
          },
        },
      },
    },
    {
      $sort: {
        day: 1,
        date: 1,
      },
    },
    {
      $group: {
        _id: "$day",
        messages: {
          $push: {
            _id: "$_id",
            chatId: "$chatId",
            sender: {
              $first: "$sender",
            },
            msg: "$msg",
            seen: "$seen",
            date: "$date",
            reactions: {
              $reduce: {
                input: "$reactions",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $cond: {
                        if: { $in: ["$$this.reaction", "$$value"] },
                        then: [],
                        else: ["$$this.reaction"],
                      },
                    },
                  ],
                },
              },
            },
            totalReactions: { $size: "$reactions" },
            seen: {
              $cond: {
                if: { $eq: [{ $size: "$seen" }, totalUsers] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        messages: 1,
      },
    },
    {
      $sort: {
        day: 1,
      },
    },
  ];
};

module.exports = mongoose.model("Message", messageScheme);

// {
//   $lookup: {
//     from: "reactions",
//     localField: "reactions",
//     foreignField: "_id",
//     as: "reactions",
//     pipeline: [
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//           pipeline: [
//             {
//               $project: {
//                 id: "$_id",
//                 _id: 0,
//                 name: 1,
//                 email: 1,
//                 avatar: 1,
//                 status: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           reaction: 1,
//           msgId: 1,
//           user: { $first: "$user" },
//         },
//       },
//       {
//         $group: {
//           _id: "$reaction",
//           total: { $sum: 1 },
//           users: {
//             $push: { $mergeObjects: ["$user", { reactionId: "$_id" }] },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           users: 1,
//           total: 1,
//           reaction: "$_id",
//         },
//       },
//     ],
//   },
// },
