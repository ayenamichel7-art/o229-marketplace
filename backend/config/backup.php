<?php

return [

    'backup' => [

        /*
         * The name of this application. You can use this name to monitor
         * the backups.
         */
        'name' => env('APP_NAME', 'laravel-backup'),

        'source' => [

            'files' => [

                /*
                 * The list of directories and files that will be included in the backup.
                 */
                'include' => [
                    base_path(),
                ],

                /*
                 * These directories and files will be excluded from the backup.
                 */
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                    storage_path('framework'),
                    storage_path('logs'),
                    storage_path('debugbar'),
                ],

                /*
                 * Determines if symbols links should be followed.
                 */
                'follow_links' => false,

                /*
                 * Determines if it should ignore unreadable files.
                 */
                'ignore_unreadable_files' => false,

                /*
                 * This method is used to customize the compression of the backup.
                 * Using 8 (Deflate) as integer to avoid ZipArchive constant issues on Windows hosts.
                 */
                'compression_method' => 8,

                /*
                 * The compression level corresponding to the used algorithm; an integer between 0 and 9.
                 */
                'compression_level' => 9,
            ],

            /*
             * The names of the connections to the databases that should be backed up.
             * MySQL, PostgreSQL, SQLite and Mongo are supported.
             *
             * The `db-dumper` package is used to create the dump.
             */
            'databases' => [
                'pgsql',
            ],
        ],

        /*
         * The database dump can be gzipped to decrease disk space usage.
         */
        'database_dump_compressor' => Spatie\DbDumper\Compressors\GzipCompressor::class,

        /*
         * The file extension used for the database dump.
         */
        'database_dump_extension' => '',

        'destination' => [

            /*
             * The filename prefix used for the backup zip file.
             */
            'filename_prefix' => 'backup-',

            /*
             * The disk names on which the backups will be stored.
             */
            'disks' => [
                'minio',
            ],
        ],

        /*
         * The directory where the temporary files will be stored.
         */
        'temporary_directory' => storage_path('app/backup-temp'),

        /*
         * The password to use for encrypting the backup zip file.
         */
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),

        /*
         * The encryption algorithm to use for encrypting the backup zip file.
         */
        'encryption' => 'default',
    ],

    /*
     * You can get notified when specific events occur. Out of the box you can use 'mail' and 'slack'.
     * For Slack you need to install guzzlehttp/guzzle and configure a webhook url.
     */
    'notifications' => [

        'notifications' => [
            \Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification::class => ['mail'],
        ],

        /*
         * Here you can specify the notifiable to which the notifications should be sent.
         */
        'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,

        'mail' => [
            'to' => env('BACKUP_NOTIFICATION_EMAIL', 'admin@o-229.com'),

            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'name' => env('MAIL_FROM_NAME', 'Example'),
            ],
        ],

        'slack' => [
            'webhook_url' => '',
            'channel' => null,
            'username' => null,
            'icon' => null,
        ],

        'discord' => [
            'webhook_url' => '',
            'username' => null,
            'avatar_url' => null,
        ],
    ],

    /*
     * Here you can specify which backups should be kept.
     */
    'cleanup' => [
        'default_strategy' => [

            /*
             * The number of days for which backups must be kept.
             */
            'keep_all_backups_for_days' => 7,

            /*
             * The number of days for which daily backups must be kept.
             */
            'keep_daily_backups_for_days' => 16,

            /*
             * The number of weeks for which weekly backups must be kept.
             */
            'keep_weekly_backups_for_weeks' => 8,

            /*
             * The number of months for which monthly backups must be kept.
             */
            'keep_monthly_backups_for_months' => 4,

            /*
             * The number of years for which yearly backups must be kept.
             */
            'keep_yearly_backups_for_years' => 2,

            /*
             * After cleaning up backups remove the oldest backup until this amount of megabytes has been reached.
             */
            'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
        ],
    ],
];
