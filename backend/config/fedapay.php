<?php

return [
    /*
    |--------------------------------------------------------------------------
    | FedaPay API Keys
    |--------------------------------------------------------------------------
    |
    | Define your FedaPay public and secret keys here. 
    | The environment can be 'sandbox' or 'live'.
    |
    */

    'public_key' => env('FEDAPAY_PUBLIC_KEY', ''),
    'secret_key' => env('FEDAPAY_SECRET_KEY', ''),
    'environment' => env('FEDAPAY_ENVIRONMENT', 'sandbox'),
];
