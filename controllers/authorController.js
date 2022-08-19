const Author = require('../models/author');
const Book = require('../models/book');

const async = require('async');
const {body, validationResult} = require('express-validator');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find()
      .sort([['family_name', 'ascending']])
      .exec(function (err, list_authors) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('author_list', { title: 'Author List', author_list: list_authors });
      });
}
  
// Display detail page for a specific Author
exports.author_detail = (req, res, next) => {
    async.parallel({
        author(callback) {
            Author.findById(req.params.id)
            .exec(callback);
        },
        author_books(callback) {
            Book.find({'author': req.params.id}, 'title summary url')
            .exec(callback);
        },
    },
    (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.author == null) {
            const err = new Error("Author not found");
            err.status = 404;
            return next(err);
        }
        res.render("author_detail", {
            title: results.author.name,
            author: results.author,
            author_books: results.author_books,
        })
    });
}

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
    res.render('author_form', {title: 'Create Author'});
};
  
// Handle Author create on POST.

exports.author_create_post = [
    body("name")
        .trim()
        .isLength({ min: 1})
        .withMessage('Name empty')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Name must be alphabet letters')
        .escape(),
    body("date_of_birth")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    body("date_of_death")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),

    (req, res, next) => {
        const errors = validationResult(req);
        const names = req.body.name.split(' ');
        const first_name = names[0];
        const family_name = names[names.length - 1];
        const author = new Author({first_name: first_name, family_name: family_name, 
            date_of_birth: req.body.date_of_birth, date_of_death: req.body.date_of_death});
        if (!errors.isEmpty()) {
            res.render("author_form", {
                title: "Create Author",
                author: req.body,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if author with same name already exists.
            Author.findOne({first_name: first_name, family_name: family_name}).exec((err, found_author) => {
                if (err) {
                    return next(err);
                }
                if (found_author) {
                    res.redirect(found_author.url);
                } else {
                    author.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        res.redirect(author.url);
                    });
                }
            });
        }
    }
];
  
// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
    async.parallel(
        {
            author(callback) {
                Author.findById(req.params.id).exec(callback);
            },
            authors_books(callback) {
                Book.find({author: req.params.id}).exec(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.author == null) {
                res.redirect("/catalog/authors");
            }
            // Successful
            res.render("author_delete", {
                title: "Delete Author",
                author: results.author,
                author_books: results.authors_books,
            })
        }
    )
}
  
// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author(callback) {
            Author.findById(req.body.authorid).exec(callback);
        },
        authors_books(callback) {
            Book.find({author:req.body.authorid}).exec(callback);
        },
    },
    (err, results) => {
        if (err) {
            return next(err);
        }
        // If there's author's book
        if (results.authors_books.length > 0) {
            res.render("author_delete", {
                title: "Delete Author",
                author: results.author,
                author_books: results.authors_books,
            });
            return;
        }
        // There's no author's book
        Author.findByIdAndRemove(req.body.authorid, (err) => {
            if (err) {
                return next(err);
            }
            // Success
            res.redirect('/catalog/authors');
        });
    });
};
  
// Display Author update form on GET.
exports.author_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update GET');
};
  
// Handle Author update on POST.
exports.author_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Author update POST');
};
  