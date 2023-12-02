#!/usr/bin/env python

import os

# RECON2023 RECON2022 | RECON2019 | RECON2018 | RECON2017 | RECON2016 | RECON2015 | RECON2014 | RECON2013 | RECON2012 | RECON2011 | RECON2010 | RECON2008 | RECON2006 | RECON2005

confs = {
    'montreal': ['2023', '2022', '2019', '2018', '2017', '2016', '2015', '2014', '2013',
                 '2012', '2011', '2010', '2008', '2006', '2005'],
    'brussels': ['2019', '2018', '2017'],
}


for loc in confs:
    for year in confs[loc]:
        os.system(f'mkdir -p ../conferences/{year}/recon/{loc}')
        os.system(f'touch ../conferences/{year}/recon/{loc}/content.json')
