"""
Command-line interface for Liftover_2D.
"""

import argparse
import os
import sys
import time
import pandas as pd
from liftover_2d.chain_mapper import ChainMapper


def process_pairs_file(args):
    """Process a .pairs file, converting coordinates between assemblies.
    
    Args:
        args: Command line arguments
    """
    print(f"Reading input file: {args.input_file}")
    df = pd.read_csv(args.input_file, sep='\t')
    
    print(f"Loading chain file: {args.chain_file}")
    mapper = ChainMapper(args.chain_file)
    
    print(f"Lifting coordinates...")
    start_time = time.time()
    result_df = mapper.lift_dataframe(
        df,
        drop_unmappable=args.drop_unmappable,
        progress=True
    )
    end_time = time.time()
    
    # Create output file
    output_df = result_df[result_df['is_mappable']].copy() if not args.keep_unmappable else result_df
    
    # Replace source coordinates with target coordinates for mappable pairs
    for idx, row in output_df.iterrows():
        if row['is_mappable']:
            output_df.at[idx, 'chrom1'] = row['target_chrom1']
            output_df.at[idx, 'pos1'] = row['target_pos1']
            output_df.at[idx, 'chrom2'] = row['target_chrom2']
            output_df.at[idx, 'pos2'] = row['target_pos2']
    
    # Remove target columns
    output_df = output_df.drop(columns=['target_chrom1', 'target_pos1', 
                                      'target_chrom2', 'target_pos2',
                                      'is_mappable'])
    
    # Save to file
    print(f"Saving to output file: {args.output_file}")
    output_df.to_csv(args.output_file, sep='\t', index=False)
    
    # Print summary statistics
    processing_time = end_time - start_time
    throughput = len(df) / processing_time
    total_pairs = len(result_df)
    mappable_pairs = result_df['is_mappable'].sum()
    mappable_percent = (mappable_pairs / total_pairs) * 100
    
    print("\nMapping Statistics:")
    print(f"- Total pairs: {total_pairs}")
    print(f"- Successfully mapped pairs: {mappable_pairs} ({mappable_percent:.1f}%)")
    print(f"- Processing time: {processing_time:.2f} seconds")
    print(f"- Throughput: {throughput:.2f} pairs/second")


def process_cool_file(args):
    """Process a .cool file, converting coordinates between assemblies.
    
    Args:
        args: Command line arguments
    """
    print("Cool file processing not yet implemented")
    print("This will convert coordinates in a cooler file between assemblies")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Liftover_2D: Convert 2D genomic coordinates between assemblies."
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Parser for the pairs command
    pairs_parser = subparsers.add_parser("pairs", help="Convert .pairs files")
    pairs_parser.add_argument("input_file", help="Input .pairs file")
    pairs_parser.add_argument("output_file", help="Output .pairs file")
    pairs_parser.add_argument("chain_file", help="Chain file for coordinate conversion")
    pairs_parser.add_argument("--drop-unmappable", action="store_true", 
                             help="Drop unmappable pairs from output")
    pairs_parser.add_argument("--keep-unmappable", action="store_true",
                             help="Keep unmappable pairs in output (original coords)")
    pairs_parser.add_argument("--threads", type=int, default=1, 
                             help="Number of threads to use")
    pairs_parser.add_argument("--chunk-size", type=int, default=1000000,
                             help="Chunk size for processing large files")
    
    # Parser for the cool command
    cool_parser = subparsers.add_parser("cool", help="Convert .cool files")
    cool_parser.add_argument("input_file", help="Input .cool file")
    cool_parser.add_argument("output_file", help="Output .cool file")
    cool_parser.add_argument("chain_file", help="Chain file for coordinate conversion")
    cool_parser.add_argument("--resolution", type=int, required=True,
                           help="Resolution of the contact matrix")
    cool_parser.add_argument("--balance", action="store_true",
                           help="Balance the output contact matrix")
    
    args = parser.parse_args()
    
    if args.command == "pairs":
        process_pairs_file(args)
    elif args.command == "cool":
        process_cool_file(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()