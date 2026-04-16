---
name: Azure Storage Public URL
description: Public Azure Blob Storage custom domain serving Parquet dataset files
type: reference
---

Parquet files are publicly accessible (anonymous) at:

`https://files.bankql.org/datasets/{name}/latest/{name}.parquet`

Storage account: `bankqlstorage`, container: `bankql-datasets`
Custom domain `files.bankql.org` maps to the container root.
