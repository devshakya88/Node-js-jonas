const fs = require("fs");
const http = require("http");
const url = require("url");

// Function to replace placeholders in templates
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  } else {
    output = output.replace(/{%NOT_ORGANIC%}/g, "");
  }

  return output;
};

// Reading template files synchronously
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // Overview Page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-Type": "text/html",
      "my-own-header": "Hello-world",
    });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);

    // Product Page
  } else if (pathname === "/product") {
    const product = dataObj[query.id];
    if (product) {
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
    } else {
      res.writeHead(404, {
        "Content-Type": "text/html",
        "my-own-header": "Hello-world",
      });
      res.end("<h1>Product Not Found</h1>");
    }

    // API Page
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(data);

    // Not Found
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
      "my-own-header": "Hello-world",
    });
    res.end("<h1>Page Not Found</h1>");
  }
});

server.listen(8000, () => {
  console.log("Server listening on Port 8000");
});
