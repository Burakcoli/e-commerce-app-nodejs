const Product = require('../models/product');


exports.getAddProduct = (req,res,next) => {
    if (!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    let message = req.flash('error');

    if (message.length > 0){
        message = message[0];
    } else {
        message = null;
    }
    res.render('admin/edit-product',
        {pageTitle:'Add Product',
        path:'/admin/add-product',
        editing: false,
        loggedIn: req.session.isLoggedIn,
        errorMessage: message});
};

exports.postAddProduct =  (req,res,next) => {
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    console.log(image);

    if (!image){
        return res.status(422).render('admin/edit-product',
        {pageTitle:'Add Product',
        path:'/admin/add-product',
        editing: false,
        errorMessage: "Attached image is invalid."});
    }

    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log("Created!");
            res.redirect('/');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req,res,next) => {
    const editMode = req.query.edit;
    if (!editMode){
        return res.redirect('/');
    }
    let message = req.flash('error');

    if (message.length > 0){
        message = message[0];
    } else {
        message = null;
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('admin/edit-product',
            {pageTitle:'Edit Product',
            product: product,
            path:'/admin/add-product',
            editing: true,
            errorMessage: message});
        })
        .catch(err => console.log(err));

};

exports.postEditProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    Product.findById(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            if (image){
                product.imageUrl = image.path;
            }

            product.description = updatedDesc;
            return product.save()
                .then(result => {
                    console.log("Updated Product.");
                    res.redirect('/admin/products');
                })
                .catch(err => console.log(err));

        })
        .catch(err => console.log(err));


};

exports.postDeleteProduct = (req,res,next)=>{
    const prodId = req.params.productId;
    Product.findByIdAndRemove(prodId)
        .then(result => {
            console.log("Deleted product!");
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));

};

exports.getAdminProducts = (req,res,next)=>{
    Product.find()
        .populate('userId')
        .then(products => {
            res.render('admin/products',
                {prods: products, 
                pageTitle: 'Admin Products',
                path:'/admin/products'});
        })
        .catch();
};