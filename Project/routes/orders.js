const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const { Order } = require('../models');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

var express = require('express');

var router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Order.find()
      .populate('customer')
      .populate('verifier')
      .populate('shipper')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      // .populate({ path: 'orderDetails.product', populate: { path: 'category' } })
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
    Order.findById(id)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      // .populate({ path: 'orderDetails.product', populate: { path: 'category' } })
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

router.get('/:id/orderDetails', function (req, res, next) {
  const { id } = req.params;
  Order.findOne({_id: id})
  .populate('orderDetails.product')
  .populate('orderDetails.size')
  .populate('orderDetails.color')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Order not found.' });
      } else {
        res.send(result.orderDetails);
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get('/:id/orderDetails/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  Order.findById(id)
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Order not found.' });
      } else {
        const orderDetails = result.orderDetails.find(detail => detail._id.toString() === _id);
        if (!orderDetails) {
          res.status(404).send({ message: 'Order detail not found.' });
        } else {
          res.send(orderDetails);
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

    const newItem = new Order(data);

    newItem
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.post('/:id/orderDetails', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Order.findOneAndUpdate(
      { _id: id },
      { $push: { orderDetails: data } },
      { new: true }
    )
      .then((result) => {
        res.send(result);
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

    Order.findByIdAndUpdate(id, data, {
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
router.patch('/:id/orderDetails/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  const { quantity } = req.body;
  Order.updateOne(
    { _id: id, 'orderDetails._id': _id },
    { $set: { 'orderDetails.$.quantity': quantity } }
  )
    .then((result) => {
      if (result.nModified === 0) {
        res.status(404).send({ message: 'Order detail not found.' });
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
    Order.findByIdAndDelete(id)
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
router.delete('/:id/orderDetails/:_id', function (req, res, next) {
  try {
    const { id, _id } = req.params;
    Order.findOneAndUpdate(
      { _id: id },
      { $pull: { orderDetails: { _id: _id } } },
      { new: true }
    )
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
// QUESTIONS 8
// ------------------------------------------------------------------------------------------------
router.get('/questions/8', function (req, res, next) {
  try {
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(new Date().setDate(fromDate.getDate() + 1));
    toDate.setHours(0, 0, 0, 0);

    const compareStatus = { $eq: ['$status', 'COMPLETED'] };
    const compareFromDate = { $gte: ['$createdDate', fromDate] };
    const compareToDate = { $lt: ['$createdDate', toDate] };
    const query = { $expr: { $and: [compareStatus, compareFromDate, compareToDate] } };

    Order.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
router.post('/status', function(req, res, next) {
  try {
    const { shipperId, status } = req.body;

    const query = {};
    if (shipperId) query.shipper = shipperId;
    if (status) query.status = status;

    Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      .then((result) => {
        res.send(result); // trả về các đơn hàng kết quả
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post('/status&date', async (req, res) => {
  try {
    const { status, shippedDateFrom, shippedDateTo } = req.body;
    const query = {
      status: status || 'Completed', 
      shippedDate: {
        $gte: shippedDateFrom || new Date('1900-01-01'), 
        $lte: shippedDateTo || new Date(), 
      },
    };
    // Query the database using the built query object
    const orders = await Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color');

    res.send(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



module.exports = router;
