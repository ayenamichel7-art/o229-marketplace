<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('support.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id || $user->isAdmin();
});

Broadcast::channel('admin.support', function ($user) {
    return $user->isAdmin();
});
