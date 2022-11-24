<?php

// Convert requests from the JavaScript object into server-side calls
// to get around CrossSiteScripting joys
class FeedlyInterface {
    function __construct(string $token) {
        $this->token = $token;
        $this->base_url = "https://cloud.feedly.com/v3";
    }

    private function getPathWithHeaders(string $path, bool $authenticated)  {
        // Create a stream
        $opts = [
            "http" => [
                "method" => "GET",
            ]
        ];
        if ($authenticated) {
            $opts['http']['header'] = "authorization: Bearer {$this->token}\r\n";
        }
        $context = stream_context_create($opts);
        // Open the file using the HTTP headers set above
        $file = file_get_contents($this->base_url . $path, false, $context);
        return $file;
    }
    public function getAllFeedsForUser() { 
        return $this->getPathWithHeaders("/subscriptions", true);
    }
    public function getLatestArticleForFeed(string $feedId) {
        $result = $this->getPathWithHeaders("/streams/contents/?count=1&streamId=" . urlencode($feedId), false);
        sleep(1);
        if ($result) {
            return json_encode(json_decode($result)->items[0] ?? []);
        }
        return "";
    }
}

include("secret.php");
$interf = new FeedlyInterface($secret);

switch ($_GET['command'] ?? "default") {
    case "contents":
        echo $interf->getLatestArticleForFeed($_GET['feedId']);
        break;
    case "subscriptions":
    case "default":
    default:
        echo $interf->getAllFeedsForUser();
}