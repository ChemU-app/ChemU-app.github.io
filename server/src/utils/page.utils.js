async function page_redirect(res, page){
res.status(302).type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="3;url=${page}">
  <title>Redirecting</title>
</head>
<body>
  <p>Redirecting you now…</p>
  <p><a href="${page}">Continue to the page</a></p>
  <script>window.location.replace(${JSON.stringify(page)});</script>
</body>
</html>`);
};


module.exports = {page_redirect};
