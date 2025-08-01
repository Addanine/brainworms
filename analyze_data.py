import csv
from datetime import datetime
import sys

def analyze_csv(filename, source_name):
    timestamps = []
    total_rows = 0
    
    print(f"\nAnalyzing {source_name} ({filename}):")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader):
                total_rows += 1
                if i < 5 or i % 10000 == 0:  # Sample every 10k rows
                    try:
                        ts = int(row['timestamp'])
                        timestamps.append(ts)
                    except:
                        continue
                        
                if total_rows >= 50000:  # Limit for analysis
                    break
        
        if timestamps:
            timestamps.sort()
            min_date = datetime.fromtimestamp(timestamps[0])
            max_date = datetime.fromtimestamp(timestamps[-1])
            
            print(f"Total rows analyzed: {total_rows:,}")
            print(f"Date range: {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}")
            
            # Get years
            years = set()
            for ts in timestamps:
                years.add(datetime.fromtimestamp(ts).year)
            print(f"Years present: {sorted(years)}")
            
    except Exception as e:
        print(f"Error reading {filename}: {e}")

# Analyze both files
analyze_csv('datasets/4chan_lgbt_detailed.csv', 'LGBT')
analyze_csv('datasets/4tran_comments_filtered.csv', '4tran')
