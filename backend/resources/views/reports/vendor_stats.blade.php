<!DOCTYPE html>
<html>
<head>
    <title>Rapport de Performance - O-229</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
        .logo { font-size: 32px; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; }
        .logo span { color: #10b981; }
        .kpi-container { width: 100%; margin-bottom: 40px; clear: both; }
        .kpi-box { width: 30%; float: left; text-align: center; background: #fdfdfd; padding: 25px 0; border: 1px solid #f0f0f0; border-radius: 15px; margin-right: 3%; }
        .kpi-value { font-size: 28px; font-weight: bold; color: #111; }
        .kpi-label { font-size: 11px; color: #10b981; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-top: 5px; }
        .table-container { clear: both; padding-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f9fafb; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #eee; }
        td { padding: 15px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #444; }
        .footer { position: fixed; bottom: 30px; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; }
        .summary-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">O-229 <span>MARKETPLACE</span></div>
        <h2 style="margin-top: 10px; font-size: 16px; color: #6b7280;">Bilan de Performance Analytique</h2>
        <p style="font-size: 13px; margin-top: 5px;">Boutique : <strong>{{ $shop->name }}</strong></p>
    </div>

    <div class="summary-header">Rapport Global (30 jours)</div>
    <div class="kpi-container">
        <div class="kpi-box">
            <div class="kpi-value">{{ number_format($totals['views']) }}</div>
            <div class="kpi-label">Vues de produits</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-value">{{ number_format($totals['leads']) }}</div>
            <div class="kpi-label">Contacts WhatsApp</div>
        </div>
        <div class="kpi-box" style="margin-right: 0;">
            <div class="kpi-value">{{ $totals['conv'] }}%</div>
            <div class="kpi-label">Taux de Conversion</div>
        </div>
    </div>

    <div class="table-container">
        <div class="summary-header">Historique Quotidien</div>
        <table>
            <thead>
                <tr>
                    <th>Date de l'activité</th>
                    <th>Vues Uniques</th>
                    <th>Contacts Générés</th>
                    <th>Efficacité (%)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($stats as $stat)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($stat->day)->translatedFormat('d F Y') }}</td>
                    <td><strong>{{ number_format($stat->views) }}</strong></td>
                    <td><strong>{{ number_format($stat->leads) }}</strong></td>
                    <td style="color: #10b981; font-weight: bold;">
                        {{ $stat->views > 0 ? round(($stat->leads / $stat->views) * 100, 1) : 0 }}%
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        Ce rapport est généré par le moteur d'analyse O-229 Analytics. &copy; {{ date('Y') }} O-229.com
    </div>
</body>
</html>
