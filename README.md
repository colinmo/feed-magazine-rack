# feed-magazine-rack
Displaying Reedly feed results in a Magazine-rack interface

Based on a post [Specifying Spring '83](https://www.robinsloan.com/lab/specifying-spring-83/), this uses a feedly authentication token to retrieve the latest 1-3 articles from all the feedly account's feeds. It then presents them like a magazine rack.

To play with this, you need to get a developer Feedly token and put it in a `secret.php` file.

```php
$secret = "token-goes-here";
```