#!/usr/bin/env python

import os

# 2023 ~ 2006 
confs = {
    'korea': [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
              2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008,
              2007, 2006],
}

for loc in confs:
    for year in confs[loc]:
        os.system(f'mkdir -p ../conferences/{year}/poc/{loc}')
        os.system(f'touch ../conferences/{year}/poc/{loc}/content.json')
