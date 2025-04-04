import unittest
import pandas as pd
import tempfile
import gzip
import os
from liftover_2d.chain_mapper import ChainMapper

class TestChainMapper(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures."""
        # Create a temporary mock chain file
        self.chain_file = tempfile.NamedTemporaryFile(suffix='.chain.gz', delete=False)
        
        # Write a simple chain file with two mappings
        with gzip.open(self.chain_file.name, 'wt') as f:
            f.write("chain 1000 chr1 250000000 + 0 100000 chr1 250000000 + 10000 110000 1\n")
            f.write("chain 800 chr2 240000000 + 0 100000 chr2 240000000 + 0 100000 2\n")
        
        self.mapper = ChainMapper(self.chain_file.name)
        
        # Also create a mock mapper for testing
        self.mock_mapper = ChainMapper()  # Uses mock data
        
    def tearDown(self):
        """Clean up test fixtures."""
        os.unlink(self.chain_file.name)
    
    def test_lift_coordinate(self):
        """Test lifting a single coordinate."""
        # Test with mock data
        result = self.mock_mapper.lift_coordinate('chr1', 12345678)
        self.assertEqual(result, ('chr1', 12355678))
        
        # Test with chain file
        result = self.mapper.lift_coordinate('chr1', 50000)
        self.assertEqual(result[0], 'chr1')  # Check chromosome
        self.assertTrue(result[1] > 50000)   # Position should be offset
        
    def test_unmappable_coordinates(self):
        """Test handling of unmappable coordinates."""
        # Non-existent chromosome
        result = self.mock_mapper.lift_coordinate('chr99', 1000000)
        self.assertIsNone(result)
        
        # Position outside chain range
        result = self.mock_mapper.lift_coordinate('chr1', 999999999)
        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main()