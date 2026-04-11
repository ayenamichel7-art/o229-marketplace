<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Public\CategoryController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\ShopController as PublicShopController;
use App\Http\Controllers\Api\Vendor\VendorChatController;
use App\Http\Controllers\Api\Admin\AdminChatController;
use App\Http\Controllers\Api\Vendor\ProductController as VendorProductController;
use App\Http\Controllers\Api\Vendor\ShopController as VendorShopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — O-229 Marketplace
|--------------------------------------------------------------------------
*/

// ─── Health Check ───────────────────────────────────────
Route::get('/ping', fn() => response()->json(['status' => 'ok', 'version' => '1.0.0']));

// ─── Authentication ─────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user', [AuthController::class, 'updateProfile']);
        
        // Notifications
        Route::get('/user/notifications', [\App\Http\Controllers\Api\Auth\NotificationController::class, 'index']);
        Route::post('/user/notifications/mark-as-read', [\App\Http\Controllers\Api\Auth\NotificationController::class, 'markAsRead']);
    });
});

// ─── Public Routes ──────────────────────────────────────
Route::prefix('products')->group(function () {
    Route::get('/', [PublicProductController::class, 'index']);
    Route::get('/city/{city}', [PublicProductController::class, 'byCity']);
    Route::get('/{slug}', [PublicProductController::class, 'show']);
    Route::get('/{slug}/similar', [PublicProductController::class, 'similar']);
    Route::post('/{id}/whatsapp-click', [\App\Http\Controllers\Api\Public\WhatsAppLeadController::class, 'trackClick'])->middleware('throttle:10,1');
});

Route::get('/search', [\App\Http\Controllers\Api\Public\SearchController::class, 'search']);

Route::prefix('shops')->group(function () {
    Route::get('/', [PublicShopController::class, 'index']);
    Route::get('/{slug}', [PublicShopController::class, 'show']);
    
    // Reviews
    Route::get('/{slug}/reviews', [\App\Http\Controllers\Api\Public\ReviewController::class, 'shopReviews']);
    Route::post('/{slug}/reviews', [\App\Http\Controllers\Api\Public\ReviewController::class, 'storeShopReview'])->middleware('auth:sanctum');
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
});

// ─── Vendor Routes (authentifié + rôle vendeur) ─────────
Route::prefix('vendor')->middleware(['auth:sanctum', 'vendor'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Api\Vendor\DashboardController::class, 'index']);
    Route::get('/analytics/report', [\App\Http\Controllers\Api\Vendor\ReportController::class, 'download']);

    // Subscriptions & Payments
    Route::get('/plans', [\App\Http\Controllers\Api\Vendor\SubscriptionController::class, 'plans']);
    Route::get('/subscription', [\App\Http\Controllers\Api\Vendor\SubscriptionController::class, 'current']);
    Route::post('/subscribe', [\App\Http\Controllers\Api\Vendor\SubscriptionController::class, 'subscribe']);

    // Shop
    Route::get('/shop', [VendorShopController::class, 'show']);
    Route::post('/shop', [VendorShopController::class, 'store']);
    Route::put('/shop', [VendorShopController::class, 'update']);
    Route::post('/shop/kyc', [VendorShopController::class, 'uploadKyc'])->middleware('throttle:6,1');

    // Products
    Route::get('/products', [VendorProductController::class, 'index']);
    Route::post('/products', [VendorProductController::class, 'store'])->middleware('verified.vendor');
    Route::get('/products/{id}', [VendorProductController::class, 'show']);
    Route::put('/products/{id}', [VendorProductController::class, 'update'])->middleware('verified.vendor');
    Route::delete('/products/{id}', [VendorProductController::class, 'destroy'])->middleware('verified.vendor');
    Route::post('/products/{id}/images', [VendorProductController::class, 'uploadImage'])->middleware(['verified.vendor', 'throttle:30,1']);
    Route::delete('/products/{id}/images/{imageId}', [VendorProductController::class, 'deleteImage'])->middleware('verified.vendor');

    // Coupons
    Route::get('/coupons', [\App\Http\Controllers\Api\Vendor\CouponController::class, 'index']);
    Route::post('/coupons', [\App\Http\Controllers\Api\Vendor\CouponController::class, 'store'])->middleware('verified.vendor');
    Route::delete('/coupons/{id}', [\App\Http\Controllers\Api\Vendor\CouponController::class, 'destroy'])->middleware('verified.vendor');

    // Support Chat
    Route::get('/support', [VendorChatController::class, 'index']);
    Route::post('/support', [VendorChatController::class, 'sendMessage']);
});

// ─── Admin Routes (authentifié + rôle admin) ────────────
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\AdminDashboardController::class, 'index']);
    
    // Vendors (Shops) KYC Verify
    Route::get('/vendors', [\App\Http\Controllers\Api\Admin\VendorVerificationController::class, 'index']);
    Route::put('/vendors/{id}/verify', [\App\Http\Controllers\Api\Admin\VendorVerificationController::class, 'toggleVerify']);

    // Products Moderation
    Route::get('/products', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'index']);
    Route::put('/products/{id}/moderate', [\App\Http\Controllers\Api\Admin\AdminProductController::class, 'moderate']);

    // Users Approval (Account Creation)
    Route::get('/users', [\App\Http\Controllers\Api\Admin\AdminUserController::class, 'index']);
    Route::put('/users/{id}/toggle-active', [\App\Http\Controllers\Api\Admin\AdminUserController::class, 'toggleActive']);

    // Support Chat
    Route::get('/support', [AdminChatController::class, 'index']);
    Route::get('/support/{id}', [AdminChatController::class, 'show']);
    Route::post('/support/{id}/reply', [AdminChatController::class, 'reply']);

    // KYC Documents (secure download)
    Route::get('/vendors/{shopId}/kyc-document', [\App\Http\Controllers\Api\Admin\AdminKycController::class, 'download']);
    // Statut de Sécurité & Logs d'Audit Cerberus
    Route::get('/audit-logs', [\App\Http\Controllers\Api\Admin\AdminAuditController::class, 'index']);

    // Contrôle WhatsApp (Evolution API)
    Route::get('/whatsapp/status', [\App\Http\Controllers\Api\Admin\AdminWhatsAppController::class, 'status']);
    Route::get('/whatsapp/qr-code', [\App\Http\Controllers\Api\Admin\AdminWhatsAppController::class, 'getQRCode']);
});

// Public Routes (No Auth)
Route::group(['prefix' => 'public'], function () {
    Route::post('/track', [\App\Http\Controllers\Api\Public\TrackingController::class, 'track'])->middleware('throttle:30,1');
    Route::post('/log-error', [\App\Http\Controllers\Api\Public\ErrorLogController::class, 'log'])->middleware('throttle:5,1');
    
    // Web Push Subscriptions
    Route::post('/push/subscribe', [\App\Http\Controllers\Api\Public\PushSubscriptionController::class, 'store']);
    Route::post('/push/unsubscribe', [\App\Http\Controllers\Api\Public\PushSubscriptionController::class, 'destroy']);

    // Payments Webhooks
    Route::post('/fedapay/webhook', [\App\Http\Controllers\Api\Public\FedaPayWebhookController::class, 'handle']);
});
