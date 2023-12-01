#!/usr/bin/env python

import os

confs = {
    'germany': [2018, 2019, 2020, 2022, 2023],
}

for loc in confs:
    for year in confs[loc]:
        os.system(f'mkdir -p ../conferences/{year}/offensivecon/{loc}')
        os.system(f'touch ../conferences/{year}/offensivecon/{loc}/content.json')
