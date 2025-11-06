import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Checking database embeddings...\n')
  
  const totalCount = await prisma.sourceCodeEmbedding.count()
  console.log(`Total embeddings: ${totalCount}`)
  
  if (totalCount > 0) {
    const byProject = await prisma.sourceCodeEmbedding.groupBy({
      by: ['projectId'],
      _count: {
        id: true
      }
    })
    
    console.log('\nEmbeddings by project:')
    for (const project of byProject) {
      const projectInfo = await prisma.project.findUnique({
        where: { id: project.projectId },
        select: { name: true, repoUrl: true }
      })
      console.log(`  - Project: ${projectInfo?.name || 'Unknown'}`)
      console.log(`    Repo: ${projectInfo?.repoUrl || 'N/A'}`)
      console.log(`    Embeddings: ${project._count.id}`)
    }
    
    const sample = await prisma.sourceCodeEmbedding.findFirst({
      select: {
        fileName: true,
        summary: true,
      }
    })
    
    if (sample) {
      console.log('\nSample embedding:')
      console.log(`  File: ${sample.fileName}`)
      console.log(`  Summary: ${sample.summary?.substring(0, 100)}...`)
    }
  } else {
    console.log('\n⚠️  No embeddings found in database!')
    console.log('\n   This means the Q&A system will not work.')
    console.log('   Please ensure projects are properly indexed.')
  }
  
  console.log('\n✅ Database check complete!\n')
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
