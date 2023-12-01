#!/usr/bin/env python

import os

confs = {
    # 1997 ~ 2023
    'phuket': [2023],
    'singapore': [2020, 2021, 2022],
    'amsterdam': [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
                  2019, 2020, 2021, 2022, 2023],
    'dubai': [2018],
    'beijing': [2018],
    'malaysia': [2011, 2012, 2013, 2014],
}

for loc in confs:
    for year in confs[loc]:
        os.system(f'mkdir -p ../conferences/{year}/hitb/{loc}')
        os.system(f'touch ../conferences/{year}/hitb/{loc}/content.json')
