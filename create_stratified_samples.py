import csv
from datetime import datetime
import random
from collections import defaultdict

def create_stratified_sample(input_file, output_file, target_per_year=10000):
    print(f"Creating stratified sample from {input_file}...")
    
    # First pass: collect all rows by year
    yearly_data = defaultdict(list)
    header = None
    total_rows = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames
        
        for row in reader:
            total_rows += 1
            try:
                timestamp = int(row['timestamp'])
                year = datetime.fromtimestamp(timestamp).year
                yearly_data[year].append(row)
            except:
                continue
            
            # Progress indicator
            if total_rows % 50000 == 0:
                print(f"  Processed {total_rows:,} rows...")
    
    print(f"  Total rows processed: {total_rows:,}")
    print(f"  Years found: {sorted(yearly_data.keys())}")
    
    # Sample from each year
    sampled_rows = []
    for year in sorted(yearly_data.keys()):
        year_rows = yearly_data[year]
        sample_size = min(target_per_year, len(year_rows))
        
        if len(year_rows) > target_per_year:
            # Random sample if we have more than target
            sampled = random.sample(year_rows, sample_size)
        else:
            # Take all if we have less than target
            sampled = year_rows
        
        sampled_rows.extend(sampled)
        print(f"  {year}: {len(year_rows):,} rows -> sampled {len(sampled):,}")
    
    # Sort by timestamp
    sampled_rows.sort(key=lambda x: int(x['timestamp']))
    
    # Write sample
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(sampled_rows)
    
    print(f"  Created {output_file} with {len(sampled_rows):,} rows")
    return len(sampled_rows)

# Create samples
print("Creating stratified samples for better time distribution...")
print("=" * 60)

# Sample LGBT data (10k per year available)
lgbt_count = create_stratified_sample(
    'datasets/4chan_lgbt_detailed.csv', 
    'datasets/lgbt_stratified.csv', 
    10000
)

print()

# Sample 4tran data (10k per year available) 
r4tran_count = create_stratified_sample(
    'datasets/4tran_comments_filtered.csv', 
    'datasets/r4tran_stratified.csv', 
    10000
)

print()
print("=" * 60)
print(f"Stratified sampling complete\!")
print(f"LGBT stratified sample: {lgbt_count:,} rows")
print(f"4tran stratified sample: {r4tran_count:,} rows")
print("These samples maintain time distribution across all available years.")
