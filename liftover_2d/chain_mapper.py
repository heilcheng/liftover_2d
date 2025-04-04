"""
Core implementation of the ChainMapper class for coordinate lifting.
"""

import numpy as np
import pandas as pd
from intervaltree import IntervalTree
import time


class ChainMapper:
    """Maps coordinates between genome assemblies using chain files."""
    
    def __init__(self, chain_file=None):
        """Initialize the chain mapper.
        
        Args:
            chain_file: Path to chain file
        """
        self.chain_file = chain_file
        self.chain_tree = self._load_chain_file()
        
    def _load_chain_file(self):
        """Load the chain file into efficient interval trees.
        
        Returns:
            Dictionary of chromosome -> interval tree mappings
        """
        # Check if we have a chain file
        if self.chain_file is None:
            # Create mock chain trees for demonstration/testing
            return self._create_mock_chain_trees()
        
        # Load real chain file
        return self._parse_chain_file()
    
    def _create_mock_chain_trees(self):
        """Create mock chain trees for testing/demonstration purposes.
        
        Returns:
            Dictionary of chromosome -> interval tree mappings
        """
        chain_trees = {}
        
        # Add mock intervals for chr1
        chain_trees['chr1'] = IntervalTree()
        
        # Add a series of 100kb blocks with 10kb offset (simulating hg19->hg38)
        for i in range(0, 100000000, 100000):
            start = i
            end = i + 100000
            chain_trees['chr1'].addi(start, end, {
                'target_chrom': 'chr1',
                'target_start': start + 10000,  # 10kb offset
                'score': 1000
            })
        
        # Add mock intervals for chr2
        chain_trees['chr2'] = IntervalTree()
        for i in range(0, 100000000, 100000):
            start = i
            end = i + 100000
            chain_trees['chr2'].addi(start, end, {
                'target_chrom': 'chr2',
                'target_start': start - 5000,  # -5kb offset
                'score': 800
            })
        
        return chain_trees
    
    def _parse_chain_file(self):
        """Parse a real chain file and build interval trees.
        
        Returns:
            Dictionary of chromosome -> interval tree mappings
        """
        # Placeholder for real chain file parser
        # This would parse the chain file format and build interval trees
        # The actual implementation would be more complex
        
        # For now, return mock data
        print(f"Note: Mock chain data used. Real parsing of {self.chain_file} not implemented yet.")
        return self._create_mock_chain_trees()
    
    def lift_coordinate(self, chrom, position):
        """Map a single coordinate from source to target assembly.
        
        Args:
            chrom: Source chromosome
            position: Source position
            
        Returns:
            Tuple of (target_chrom, target_position) or None if unmappable
        """
        if chrom not in self.chain_tree:
            return None
        
        # Find overlapping intervals
        overlaps = self.chain_tree[chrom].overlap(position, position + 1)
        if not overlaps:
            return None
        
        # Select best mapping based on score
        best_chain = max(overlaps, key=lambda x: x.data['score'])
        
        # Calculate target position
        source_offset = position - best_chain.begin
        target_pos = best_chain.data['target_start'] + source_offset
        
        return (best_chain.data['target_chrom'], target_pos)
    
    def lift_coordinate_pair(self, chrom1, pos1, chrom2, pos2):
        """Map a pair of coordinates from source to target assembly.
        
        Args:
            chrom1: First chromosome
            pos1: First position
            chrom2: Second chromosome
            pos2: Second position
            
        Returns:
            Tuple of (target_chrom1, target_pos1, target_chrom2, target_pos2)
            or None if either coordinate is unmappable
        """
        result1 = self.lift_coordinate(chrom1, pos1)
        result2 = self.lift_coordinate(chrom2, pos2)
        
        if result1 is None or result2 is None:
            return None
        
        return result1 + result2
    
    def lift_dataframe(self, df, chrom1_col='chrom1', pos1_col='pos1',
                      chrom2_col='chrom2', pos2_col='pos2', 
                      drop_unmappable=False, progress=False):
        """Lift all coordinate pairs in a DataFrame.
        
        Args:
            df: DataFrame containing pairs to lift
            chrom1_col, pos1_col, chrom2_col, pos2_col: Column names
            drop_unmappable: Whether to drop unmappable pairs
            progress: Whether to show progress bar
            
        Returns:
            DataFrame with lifted coordinates added
        """
        # Create new columns for target coordinates
        result_df = df.copy()
        result_df['target_chrom1'] = None
        result_df['target_pos1'] = None
        result_df['target_chrom2'] = None
        result_df['target_pos2'] = None
        result_df['is_mappable'] = False
        
        # Process each row
        total = len(df)
        for i, (idx, row) in enumerate(df.iterrows()):
            if progress and i % 1000 == 0:
                print(f"Processing pair {i}/{total}\r", end='')
                
            result = self.lift_coordinate_pair(
                row[chrom1_col], row[pos1_col],
                row[chrom2_col], row[pos2_col]
            )
            
            if result is not None:
                result_df.at[idx, 'target_chrom1'] = result[0]
                result_df.at[idx, 'target_pos1'] = result[1]
                result_df.at[idx, 'target_chrom2'] = result[2]
                result_df.at[idx, 'target_pos2'] = result[3]
                result_df.at[idx, 'is_mappable'] = True
        
        if progress:
            print(f"\nProcessed {total} pairs")
        
        # Drop unmappable pairs if requested
        if drop_unmappable:
            result_df = result_df[result_df['is_mappable']]
            
        return result_df