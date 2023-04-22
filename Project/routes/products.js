const yup = require('yup');
var { validateSchema } = require('../validation/validateSchema');

const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const { Product } = require('../models');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

var express = require('express');
var router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Product.find()
    .populate('category')
    .populate('color')
    .populate('size')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

/* GET BY ID */
router.get('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    Product.findById(id)
    .populate('category')
      .populate('color')
      .populate('size')
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get('/:id/variants/:colorId/sizes/:sizeId', function (req, res, next) {
  const { id, colorId, sizeId } = req.params;
  Product.findOne(
    { _id: id, variants: { $elemMatch: { colorId, 'sizes.sizeId': sizeId } } },
    { 'variants.$': 1 }
  ) 
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Product not found.' });
      } else {
        const variant = result.variants[0];
        if (!variant) {
          res.status(404).send({ message: 'Product variant not found.' });
        } else {
          const size = variant.sizes.find((s) => String(s.sizeId) === sizeId);
          if (!size) {
            res.status(404).send({ message: 'Product size not found.' });
          } else {
            res.send(size);
          }
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});





/* POST */
router.post('/', function (req, res, next) {
  try {
    const data = req.body;

    const newItem = new Product(data);

    newItem
      .save()
      .then((result) => {
        res.status(201).send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// PATCH
router.patch('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Product.findByIdAndUpdate(id, data, {
      new: true,
    })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.patch('/:id/variants/:colorId/sizes/:sizeId', function (req, res, next) {
  const { id, colorId, sizeId } = req.params;
  const { quantity } = req.body;
  Product.updateOne(
    { _id: id, variants: { $elemMatch: { colorId, 'sizes.sizeId': sizeId } } },
    { $set: { 'variants.$[i].sizes.$[j].quantity': quantity } },
    { arrayFilters: [{ 'i.colorId': colorId }, { 'j.sizeId': sizeId }] }
  )
    .then((result) => {
      if (result.nModified === 0) {
        res.status(404).send({ message: 'Product not found.' });
      } else {
        res.send({ message: 'Quantity updated.' });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});



// DELETE
router.delete('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    Product.findByIdAndDelete(id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 1
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/manual/reference/operator/query/
// http://localhost:9000/products/questions/1?discount=10

const question1Schema = yup.object({
  query: yup.object({
    discount: yup.number().integer().min(0).max(100).required(),
  }),
});

// router.get('/questions/1', validateSchema(question1Schema), function (req, res, next) {
//   try {
//     let discount = req.query.discount;
//     let query = { discount: { $lte: discount } };
//     Product.find(query)
//       // .populate('productname')
//       .populate('supplier')
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

// ------------------------------------------------------------------------------------------------
// QUESTIONS 1b
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/manual/reference/operator/query/
// router.get('/questions/1b', function (req, res, next) {
//   try {
//     let query = { discount: { $lte: 10 } };
//     Product.find(query)
//       .populate('product')
//       // .populate('supplier')
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

// ------------------------------------------------------------------------------------------------
// QUESTIONS 2
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/manual/reference/operator/query/
// http://localhost:9000/products/questions/2?stock=10
// router.get('/questions/2', function (req, res, next) {
//   try {
//     let stock = req.query.stock;
//     let query = { stock: { $lte: stock } };
//     Product.find(query)
//       .populate('category')
//       // .populate('supplier')
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });
// ------------------------------------------------------------------------------------------------
// QUESTIONS 3
// ------------------------------------------------------------------------------------------------
// http://localhost:9000/products/questions/3?price=100000
// router.get('/questions/3', async (req, res, next) => {
//   try {
//     // let finalPrice = price * (100 - discount) / 100;
//     const s = { $subtract: [100, '$discount'] }; // (100 - 5)
//     const m = { $multiply: ['$price', s] }; // price * 95
//     const d = { $divide: [m, 100] }; // price * 95 / 100

//     const { price } = req.query;

//     let aggregate = [{ $match: { $expr: { $lte: [d, price] } } }];
//     Product.aggregate(aggregate)
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).json(err);
//       });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

module.exports = router;
