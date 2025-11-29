#!/bin/bash
# Auto-process hook - triggers when new articles are fetched

echo "🎃 Kiro Hook: Auto-processing new articles..."

# Get count of unprocessed articles
UNPROCESSED=$(curl -s http://localhost:8000/api/v1/processing/stats | grep -o '"unprocessed":[0-9]*' | grep -o '[0-9]*')

if [ "$UNPROCESSED" -gt 0 ]; then
    echo "📊 Found $UNPROCESSED unprocessed articles"
    echo "🔮 Initiating background processing..."
    
    # Trigger processing
    curl -X POST http://localhost:8000/api/v1/processing/process-all
    
    echo "✅ Processing initiated for $UNPROCESSED articles"
else
    echo "✨ All articles already processed"
fi