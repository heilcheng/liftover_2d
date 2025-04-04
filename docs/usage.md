# Liftover_2D Usage Guide

## Installation

```bash
# Install from PyPI
pip install liftover_2d

# Or install from source
git clone https://github.com/YOUR-USERNAME/liftover_2d.git
cd liftover_2d
pip install -e .
```

## Command Line Interface

Liftover_2D provides a simple command line interface for processing your data.

### Processing .pairs Files

The basic syntax for processing .pairs files is:

```bash
liftover_2d pairs INPUT_FILE OUTPUT_FILE CHAIN_FILE [OPTIONS]
```

For example:

```bash
# Basic usage
liftover_2d pairs sample_hic.pairs sample_hic.hg38.pairs hg19ToHg38.chain.gz

# With additional options
liftover_2d pairs sample_hic.pairs sample_hic.hg38.pairs hg19ToHg38.chain.gz \
    --drop-unmappable \
    --threads 4 \
    --chunk-size 1000000
```

#### Options:

- `--drop-unmappable`: Exclude pairs that can't be mapped to the target assembly
- `--keep-unmappable`: Include unmappable pairs in the output (keeping original coordinates)
- `--threads INT`: Number of threads to use for parallel processing
- `--chunk-size INT`: Process the file in chunks of this size (for large files)

### Processing .cool Files

For .cool files, the syntax is:

```bash
liftover_2d cool INPUT_FILE OUTPUT_FILE CHAIN_FILE --resolution RES [OPTIONS]
```

For example:

```bash
liftover_2d cool sample_hic.cool sample_hic.hg38.cool hg19ToHg38.chain.gz \
    --resolution 10000 \
    --balance
```

#### Options:

- `--resolution INT`: Resolution of the contact matrix (required)
- `--balance`: Apply balancing to the output matrix

## Python API

You can also use Liftover_2D directly in your Python code:

```python
import pandas as pd
from liftover_2d import ChainMapper

# Load your data
df = pd.read_csv('sample_hic.pairs', sep='\t')

# Initialize the mapper
mapper = ChainMapper('hg19ToHg38.chain.gz')

# Process the data
result_df = mapper.lift_dataframe(df, progress=True)

# Do something with the results
mapped_pairs = result_df[result_df['is_mappable']]
print(f"Successfully mapped {len(mapped_pairs)} out of {len(df)} pairs")
```

## Chain Files

Liftover_2D uses UCSC chain files to map coordinates between genome assemblies. You can download these files from the UCSC Genome Browser:

- [hg19ToHg38.over.chain.gz](https://hgdownload.soe.ucsc.edu/goldenPath/hg19/liftOver/hg19ToHg38.over.chain.gz)
- [hg38ToHg19.over.chain.gz](https://hgdownload.soe.ucsc.edu/goldenPath/hg38/liftOver/hg38ToHg19.over.chain.gz)
- [mm9ToMm10.over.chain.gz](https://hgdownload.soe.ucsc.edu/goldenPath/mm9/liftOver/mm9ToMm10.over.chain.gz)

... and many more.

## Advanced Usage

For more advanced usage scenarios, please refer to the [API documentation](api.md).