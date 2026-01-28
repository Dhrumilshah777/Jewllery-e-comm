const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    console.log('getProducts query:', req.query);
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const isTrendy = req.query.isTrendy === 'true' ? { isTrendy: true } : {};
    
    let isLatestBeauty = {};
    if (req.query.isLatestBeauty === 'true') {
      isLatestBeauty = { isLatestBeauty: true };
    } else if (req.query.isLatestBeauty === 'false') {
      isLatestBeauty = { isLatestBeauty: { $ne: true } };
    }

    const category = req.query.category 
      ? { 
          category: {
            $regex: req.query.category.trim(),
            $options: 'i',
          } 
        } 
      : {};

    let query = Product.find({ ...keyword, ...isTrendy, ...isLatestBeauty, ...category });

    if (req.query.sort === 'latest') {
      query = query.sort({ createdAt: -1 });
    }

    if (req.query.limit) {
      query = query.limit(Number(req.query.limit));
    }

    const products = await query;
    console.log(`Found ${products.length} products for query:`, { isTrendy: !!isTrendy.isTrendy, isLatestBeauty: !!isLatestBeauty.isLatestBeauty });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  console.log('createProduct body:', req.body);
  const { name, price, description, imageUrl, category, stock, isTrendy, isLatestBeauty, subImages } = req.body;
  
  // Explicitly cast to boolean to avoid string/type issues
  const isTrendyBool = isTrendy === true || isTrendy === 'true';
  const isLatestBeautyBool = isLatestBeauty === true || isLatestBeauty === 'true';

  console.log('Saving product with flags:', { 
    originalTrendy: isTrendy, 
    originalLatest: isLatestBeauty,
    finalTrendy: isTrendyBool, 
    finalLatest: isLatestBeautyBool 
  });

  try {
    const product = new Product({
      name,
      price,
      description,
      imageUrl,
      category,
      stock,
      isTrendy: isTrendyBool,
      isLatestBeauty: isLatestBeautyBool,
      subImages
    });

    const createdProduct = await product.save();

    // Send Push Notification
    // try {
    //   await sendPushToAll({
    //     title: 'New Product Alert!',
    //     message: `Check out our new arrival: ${name}`,
    //     url: `/products/${createdProduct._id}`, // Deep link to the new product
    //     icon: imageUrl // Use product image as icon
    //   });
    // } catch (notifyErr) {
    //   console.error('Failed to send notification for new product:', notifyErr);
    //   // Don't fail the request just because notification failed
    // }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, price, description, imageUrl, category, stock, isTrendy, isLatestBeauty, subImages } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.imageUrl = imageUrl || product.imageUrl;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    
    // Explicitly handle boolean updates
    if (isTrendy !== undefined) {
      product.isTrendy = isTrendy === true || isTrendy === 'true';
    }
    
    if (isLatestBeauty !== undefined) {
      product.isLatestBeauty = isLatestBeauty === true || isLatestBeauty === 'true';
    }

    product.subImages = subImages || product.subImages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
