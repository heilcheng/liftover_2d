from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="liftover_2d",
    version="0.1.0",
    author="Hailey Cheng",
    description="Fast 2D genomic coordinate conversion for chromatin interaction data",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/heilcheng/liftover_2d",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Scientific/Engineering :: Bio-Informatics",
        "Intended Audience :: Science/Research",
    ],
    python_requires=">=3.6",
    install_requires=[
        "numpy",
        "pandas",
        "intervaltree",
        "matplotlib",
        "seaborn",
    ],
    entry_points={
        "console_scripts": [
            "liftover_2d=liftover_2d.cli:main",
        ],
    },
)