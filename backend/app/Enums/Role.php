<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Vendor = 'vendor';
    case Client = 'client';
}
