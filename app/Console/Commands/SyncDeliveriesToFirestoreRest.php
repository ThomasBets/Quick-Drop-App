<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FirestoreSyncService;

class SyncDeliveriesToFirestoreRest extends Command
{
    protected $signature = 'app:sync-deliveries-rest';
    protected $description = 'Sync deliveries to Firestore via REST API';

    protected $syncService;

    public function __construct(FirestoreSyncService $syncService)
    {
        parent::__construct();
        $this->syncService = $syncService;
    }

    public function handle()
    {
        $this->info('Starting REST API sync to Firestore...');
        $this->syncService->syncAllDeliveries();
        $this->info('Sync completed.');
        return 0;
    }
}
