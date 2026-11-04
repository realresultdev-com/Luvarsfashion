$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;

public class LogoGenerator
{
    public static void GenerateLogo(string outputPath, bool isWhite, int width, int height)
    {
        using (Bitmap bmp = new Bitmap(width, height))
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.Clear(Color.Transparent);

            Color cyanColor = Color.FromArgb(255, 56, 189, 248);
            Color goldColor = Color.FromArgb(255, 251, 191, 36);
            Color textColor = isWhite ? Color.FromArgb(255, 255, 255, 255) : Color.FromArgb(255, 15, 23, 42);

            // Draw Emblem Badge (Left)
            float cx = 80f;
            float cy = 90f;
            float r = 50f;

            PointF[] badgePts = new PointF[]
            {
                new PointF(cx, cy - r),
                new PointF(cx + r * 0.866f, cy - r * 0.5f),
                new PointF(cx + r * 0.866f, cy + r * 0.5f),
                new PointF(cx, cy + r),
                new PointF(cx - r * 0.866f, cy + r * 0.5f),
                new PointF(cx - r * 0.866f, cy - r * 0.5f)
            };

            using (Pen badgePen = new Pen(cyanColor, 3.5f))
            {
                g.DrawPolygon(badgePen, badgePts);
            }

            // Monogram 'L'
            using (Font lFont = new Font("Arial Black", 34f, FontStyle.Bold))
            using (SolidBrush cyanBrush = new SolidBrush(cyanColor))
            {
                g.DrawString("L", lFont, cyanBrush, cx - 23f, cy - 30f);
            }

            // Mini Crown / Star on badge corner
            PointF[] starPts = new PointF[]
            {
                new PointF(cx + 38f, cy - 48f),
                new PointF(cx + 42f, cy - 42f),
                new PointF(cx + 49f, cy - 40f),
                new PointF(cx + 42f, cy - 38f),
                new PointF(cx + 38f, cy - 32f),
                new PointF(cx + 34f, cy - 38f),
                new PointF(cx + 27f, cy - 40f),
                new PointF(cx + 34f, cy - 42f)
            };
            using (SolidBrush goldBrush = new SolidBrush(goldColor))
            {
                g.FillPolygon(goldBrush, starPts);
            }

            // Wordmark: LUVARS
            using (Font mainFont = new Font("Segoe UI", 48f, FontStyle.Bold))
            using (SolidBrush textBrush = new SolidBrush(textColor))
            {
                g.DrawString("LUVARS", mainFont, textBrush, 148f, 26f);
            }

            // Subtext: F A S H I O N
            using (Font subFont = new Font("Segoe UI", 15f, FontStyle.Bold))
            using (SolidBrush cyanBrush = new SolidBrush(cyanColor))
            {
                g.DrawString("F A S H I O N", subFont, cyanBrush, 154f, 108f);
            }

            bmp.Save(outputPath, ImageFormat.Png);
        }
    }

    public static void GenerateFavicon(string outputPath, int size)
    {
        using (Bitmap bmp = new Bitmap(size, size))
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.Transparent);

            Color bgColor = Color.FromArgb(255, 15, 23, 42);
            Color cyanColor = Color.FromArgb(255, 56, 189, 248);

            using (SolidBrush bgBrush = new SolidBrush(bgColor))
            {
                g.FillEllipse(bgBrush, 2, 2, size - 4, size - 4);
            }

            using (Pen cyanPen = new Pen(cyanColor, 3f))
            {
                g.DrawEllipse(cyanPen, 2, 2, size - 4, size - 4);
            }

            using (Font font = new Font("Arial Black", 26f, FontStyle.Bold))
            using (SolidBrush cyanBrush = new SolidBrush(cyanColor))
            {
                g.DrawString("L", font, cyanBrush, 17f, 10f);
            }

            bmp.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies "System.Drawing"

$pub = "c:\Users\kavin\Desktop\shirt e-commerce\Buddy-Mattress\public"
[LogoGenerator]::GenerateLogo("$pub\logo-white.png", $true, 560, 170)
[LogoGenerator]::GenerateLogo("$pub\logo-trimmed.png", $true, 560, 170)
[LogoGenerator]::GenerateLogo("$pub\logo.png", $false, 560, 170)
[LogoGenerator]::GenerateLogo("$pub\logo-transparent.png", $false, 560, 170)
[LogoGenerator]::GenerateFavicon("$pub\favicon.png", 64)

Write-Host "All Luvars Fashion logos generated successfully!"
