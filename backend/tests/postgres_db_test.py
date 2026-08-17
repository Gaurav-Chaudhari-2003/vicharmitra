import asyncio
import asyncpg


async def main():
    conn = await asyncpg.connect(
        user="vicharmitra",
        password="reset123",
        database="vicharmitra",
        host="localhost",
        port=5432
    )

    version = await conn.fetchval("SELECT version();")
    print(version)

    await conn.close()


asyncio.run(main())
