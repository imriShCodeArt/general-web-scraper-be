// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { promises as fs } from 'fs';
import { join } from 'path';
import { StorageEntry, JobResult } from '../types';
export class StorageService {
  private inMemoryStorage = new Map<string, StorageEntry>();
  private storageDir: string;
  private cleanupInterval!: NodeJS.Timeout;
  constructor(storageDir: string = stryMutAct_9fa48("5278") ? "" : (stryCov_9fa48("5278"), './storage')) {
    if (stryMutAct_9fa48("5279")) {
      {}
    } else {
      stryCov_9fa48("5279");
      this.storageDir = storageDir;
      this.ensureStorageDir();
      this.startCleanupInterval();
    }
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    if (stryMutAct_9fa48("5280")) {
      {}
    } else {
      stryCov_9fa48("5280");
      try {
        if (stryMutAct_9fa48("5281")) {
          {}
        } else {
          stryCov_9fa48("5281");
          await fs.mkdir(this.storageDir, stryMutAct_9fa48("5282") ? {} : (stryCov_9fa48("5282"), {
            recursive: stryMutAct_9fa48("5283") ? false : (stryCov_9fa48("5283"), true)
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5284")) {
          {}
        } else {
          stryCov_9fa48("5284");
          console.error(stryMutAct_9fa48("5285") ? "" : (stryCov_9fa48("5285"), 'Failed to create storage directory:'), error);
        }
      }
    }
  }

  /**
   * Store job results in both memory and filesystem
   */
  async storeJobResult(jobId: string, result: JobResult): Promise<void> {
    if (stryMutAct_9fa48("5286")) {
      {}
    } else {
      stryCov_9fa48("5286");
      console.log(stryMutAct_9fa48("5287") ? "" : (stryCov_9fa48("5287"), '🔍 DEBUG: storeJobResult called with:'), stryMutAct_9fa48("5288") ? {} : (stryCov_9fa48("5288"), {
        jobId,
        parentCsvLength: result.parentCsv.length,
        variationCsvLength: result.variationCsv.length,
        productCount: result.productCount,
        variationCount: result.variationCount
      }));
      const entry: StorageEntry = stryMutAct_9fa48("5289") ? {} : (stryCov_9fa48("5289"), {
        jobId,
        parentCsv: result.parentCsv,
        variationCsv: result.variationCsv,
        metadata: result,
        createdAt: new Date(),
        expiresAt: new Date(stryMutAct_9fa48("5290") ? Date.now() - 24 * 60 * 60 * 1000 : (stryCov_9fa48("5290"), Date.now() + (stryMutAct_9fa48("5291") ? 24 * 60 * 60 / 1000 : (stryCov_9fa48("5291"), (stryMutAct_9fa48("5292") ? 24 * 60 / 60 : (stryCov_9fa48("5292"), (stryMutAct_9fa48("5293") ? 24 / 60 : (stryCov_9fa48("5293"), 24 * 60)) * 60)) * 1000)))) // 24 hours
      });

      // Store in memory
      this.inMemoryStorage.set(jobId, entry);

      // Store in filesystem
      await this.storeToFilesystem(jobId, entry);
      console.log(stryMutAct_9fa48("5294") ? "" : (stryCov_9fa48("5294"), '🔍 DEBUG: storeJobResult completed for jobId:'), jobId);
    }
  }

  /**
   * Store entry to filesystem
   */
  private async storeToFilesystem(jobId: string, entry: StorageEntry): Promise<void> {
    if (stryMutAct_9fa48("5295")) {
      {}
    } else {
      stryCov_9fa48("5295");
      try {
        if (stryMutAct_9fa48("5296")) {
          {}
        } else {
          stryCov_9fa48("5296");
          const filePath = join(this.storageDir, stryMutAct_9fa48("5297") ? `` : (stryCov_9fa48("5297"), `${jobId}.json`));
          const fileContent = stryMutAct_9fa48("5298") ? {} : (stryCov_9fa48("5298"), {
            ...entry,
            createdAt: entry.createdAt.toISOString(),
            expiresAt: entry.expiresAt.toISOString()
          });
          await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), stryMutAct_9fa48("5299") ? "" : (stryCov_9fa48("5299"), 'utf-8'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5300")) {
          {}
        } else {
          stryCov_9fa48("5300");
          console.error(stryMutAct_9fa48("5301") ? `` : (stryCov_9fa48("5301"), `Failed to store job ${jobId} to filesystem:`), error);
        }
      }
    }
  }

  /**
   * Retrieve job result from memory first, then filesystem
   */
  async getJobResult(jobId: string): Promise<StorageEntry | null> {
    if (stryMutAct_9fa48("5302")) {
      {}
    } else {
      stryCov_9fa48("5302");
      console.log(stryMutAct_9fa48("5303") ? "" : (stryCov_9fa48("5303"), '🔍 DEBUG: getJobResult called for jobId:'), jobId);

      // Check memory first
      const memoryEntry = this.inMemoryStorage.get(jobId);
      if (stryMutAct_9fa48("5305") ? false : stryMutAct_9fa48("5304") ? true : (stryCov_9fa48("5304", "5305"), memoryEntry)) {
        if (stryMutAct_9fa48("5306")) {
          {}
        } else {
          stryCov_9fa48("5306");
          console.log(stryMutAct_9fa48("5307") ? "" : (stryCov_9fa48("5307"), '🔍 DEBUG: getJobResult found in memory:'), stryMutAct_9fa48("5308") ? {} : (stryCov_9fa48("5308"), {
            hasParentCsv: stryMutAct_9fa48("5309") ? !memoryEntry.parentCsv : (stryCov_9fa48("5309"), !(stryMutAct_9fa48("5310") ? memoryEntry.parentCsv : (stryCov_9fa48("5310"), !memoryEntry.parentCsv))),
            parentCsvLength: memoryEntry.parentCsv.length,
            hasVariationCsv: stryMutAct_9fa48("5311") ? !memoryEntry.variationCsv : (stryCov_9fa48("5311"), !(stryMutAct_9fa48("5312") ? memoryEntry.variationCsv : (stryCov_9fa48("5312"), !memoryEntry.variationCsv))),
            variationCsvLength: memoryEntry.variationCsv.length
          }));
          return memoryEntry;
        }
      }
      console.log(stryMutAct_9fa48("5313") ? "" : (stryCov_9fa48("5313"), '🔍 DEBUG: getJobResult not found in memory, checking filesystem'));
      // Check filesystem
      const filesystemEntry = await this.loadFromFilesystem(jobId);
      if (stryMutAct_9fa48("5315") ? false : stryMutAct_9fa48("5314") ? true : (stryCov_9fa48("5314", "5315"), filesystemEntry)) {
        if (stryMutAct_9fa48("5316")) {
          {}
        } else {
          stryCov_9fa48("5316");
          console.log(stryMutAct_9fa48("5317") ? "" : (stryCov_9fa48("5317"), '🔍 DEBUG: getJobResult found in filesystem:'), stryMutAct_9fa48("5318") ? {} : (stryCov_9fa48("5318"), {
            hasParentCsv: stryMutAct_9fa48("5319") ? !filesystemEntry.parentCsv : (stryCov_9fa48("5319"), !(stryMutAct_9fa48("5320") ? filesystemEntry.parentCsv : (stryCov_9fa48("5320"), !filesystemEntry.parentCsv))),
            parentCsvLength: filesystemEntry.parentCsv.length,
            hasVariationCsv: stryMutAct_9fa48("5321") ? !filesystemEntry.variationCsv : (stryCov_9fa48("5321"), !(stryMutAct_9fa48("5322") ? filesystemEntry.variationCsv : (stryCov_9fa48("5322"), !filesystemEntry.variationCsv))),
            variationCsvLength: filesystemEntry.variationCsv.length
          }));
        }
      } else {
        if (stryMutAct_9fa48("5323")) {
          {}
        } else {
          stryCov_9fa48("5323");
          console.log(stryMutAct_9fa48("5324") ? "" : (stryCov_9fa48("5324"), '🔍 DEBUG: getJobResult not found anywhere'));
        }
      }
      return filesystemEntry;
    }
  }

  /**
   * Load entry from filesystem
   */
  private async loadFromFilesystem(jobId: string): Promise<StorageEntry | null> {
    if (stryMutAct_9fa48("5325")) {
      {}
    } else {
      stryCov_9fa48("5325");
      try {
        if (stryMutAct_9fa48("5326")) {
          {}
        } else {
          stryCov_9fa48("5326");
          const filePath = join(this.storageDir, stryMutAct_9fa48("5327") ? `` : (stryCov_9fa48("5327"), `${jobId}.json`));
          const fileContent = await fs.readFile(filePath, stryMutAct_9fa48("5328") ? "" : (stryCov_9fa48("5328"), 'utf-8'));
          const parsed = JSON.parse(fileContent);

          // Convert ISO strings back to Date objects
          const entry: StorageEntry = stryMutAct_9fa48("5329") ? {} : (stryCov_9fa48("5329"), {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            expiresAt: new Date(parsed.expiresAt)
          });

          // Cache in memory
          this.inMemoryStorage.set(jobId, entry);
          return entry;
        }
      } catch (error) {
        if (stryMutAct_9fa48("5330")) {
          {}
        } else {
          stryCov_9fa48("5330");
          return null;
        }
      }
    }
  }

  /**
   * Get all job IDs
   */
  async getAllJobIds(): Promise<string[]> {
    if (stryMutAct_9fa48("5331")) {
      {}
    } else {
      stryCov_9fa48("5331");
      const memoryIds = Array.from(this.inMemoryStorage.keys());
      try {
        if (stryMutAct_9fa48("5332")) {
          {}
        } else {
          stryCov_9fa48("5332");
          const files = await fs.readdir(this.storageDir);
          const fileIds = stryMutAct_9fa48("5333") ? files.map(file => file.replace('.json', '')) : (stryCov_9fa48("5333"), files.filter(stryMutAct_9fa48("5334") ? () => undefined : (stryCov_9fa48("5334"), file => stryMutAct_9fa48("5335") ? file.startsWith('.json') : (stryCov_9fa48("5335"), file.endsWith(stryMutAct_9fa48("5336") ? "" : (stryCov_9fa48("5336"), '.json'))))).map(stryMutAct_9fa48("5337") ? () => undefined : (stryCov_9fa48("5337"), file => file.replace(stryMutAct_9fa48("5338") ? "" : (stryCov_9fa48("5338"), '.json'), stryMutAct_9fa48("5339") ? "Stryker was here!" : (stryCov_9fa48("5339"), '')))));

          // Merge and deduplicate
          const allIds = stryMutAct_9fa48("5340") ? [] : (stryCov_9fa48("5340"), [...new Set(stryMutAct_9fa48("5341") ? [] : (stryCov_9fa48("5341"), [...memoryIds, ...fileIds]))]);
          return allIds;
        }
      } catch (error) {
        if (stryMutAct_9fa48("5342")) {
          {}
        } else {
          stryCov_9fa48("5342");
          return memoryIds;
        }
      }
    }
  }

  /**
   * Delete job result
   */
  async deleteJobResult(jobId: string): Promise<boolean> {
    if (stryMutAct_9fa48("5343")) {
      {}
    } else {
      stryCov_9fa48("5343");
      // Remove from memory
      const memoryRemoved = this.inMemoryStorage.delete(jobId);

      // Remove from filesystem
      let fileRemoved = stryMutAct_9fa48("5344") ? true : (stryCov_9fa48("5344"), false);
      try {
        if (stryMutAct_9fa48("5345")) {
          {}
        } else {
          stryCov_9fa48("5345");
          const filePath = join(this.storageDir, stryMutAct_9fa48("5346") ? `` : (stryCov_9fa48("5346"), `${jobId}.json`));
          await fs.unlink(filePath);
          fileRemoved = stryMutAct_9fa48("5347") ? false : (stryCov_9fa48("5347"), true);
        }
      } catch (error) {
        // File might not exist
      }
      return stryMutAct_9fa48("5350") ? memoryRemoved && fileRemoved : stryMutAct_9fa48("5349") ? false : stryMutAct_9fa48("5348") ? true : (stryCov_9fa48("5348", "5349", "5350"), memoryRemoved || fileRemoved);
    }
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    if (stryMutAct_9fa48("5351")) {
      {}
    } else {
      stryCov_9fa48("5351");
      const now = new Date();
      const expiredIds: string[] = stryMutAct_9fa48("5352") ? ["Stryker was here"] : (stryCov_9fa48("5352"), []);

      // Check memory storage
      for (const [jobId, entry] of this.inMemoryStorage.entries()) {
        if (stryMutAct_9fa48("5353")) {
          {}
        } else {
          stryCov_9fa48("5353");
          if (stryMutAct_9fa48("5357") ? entry.expiresAt >= now : stryMutAct_9fa48("5356") ? entry.expiresAt <= now : stryMutAct_9fa48("5355") ? false : stryMutAct_9fa48("5354") ? true : (stryCov_9fa48("5354", "5355", "5356", "5357"), entry.expiresAt < now)) {
            if (stryMutAct_9fa48("5358")) {
              {}
            } else {
              stryCov_9fa48("5358");
              expiredIds.push(jobId);
            }
          }
        }
      }

      // Remove expired entries
      for (const jobId of expiredIds) {
        if (stryMutAct_9fa48("5359")) {
          {}
        } else {
          stryCov_9fa48("5359");
          await this.deleteJobResult(jobId);
        }
      }

      // Check filesystem for expired entries
      try {
        if (stryMutAct_9fa48("5360")) {
          {}
        } else {
          stryCov_9fa48("5360");
          const files = await fs.readdir(this.storageDir);
          for (const file of files) {
            if (stryMutAct_9fa48("5361")) {
              {}
            } else {
              stryCov_9fa48("5361");
              if (stryMutAct_9fa48("5364") ? file.startsWith('.json') : stryMutAct_9fa48("5363") ? false : stryMutAct_9fa48("5362") ? true : (stryCov_9fa48("5362", "5363", "5364"), file.endsWith(stryMutAct_9fa48("5365") ? "" : (stryCov_9fa48("5365"), '.json')))) {
                if (stryMutAct_9fa48("5366")) {
                  {}
                } else {
                  stryCov_9fa48("5366");
                  const jobId = file.replace(stryMutAct_9fa48("5367") ? "" : (stryCov_9fa48("5367"), '.json'), stryMutAct_9fa48("5368") ? "Stryker was here!" : (stryCov_9fa48("5368"), ''));
                  const entry = await this.loadFromFilesystem(jobId);
                  if (stryMutAct_9fa48("5371") ? entry || entry.expiresAt < now : stryMutAct_9fa48("5370") ? false : stryMutAct_9fa48("5369") ? true : (stryCov_9fa48("5369", "5370", "5371"), entry && (stryMutAct_9fa48("5374") ? entry.expiresAt >= now : stryMutAct_9fa48("5373") ? entry.expiresAt <= now : stryMutAct_9fa48("5372") ? true : (stryCov_9fa48("5372", "5373", "5374"), entry.expiresAt < now)))) {
                    if (stryMutAct_9fa48("5375")) {
                      {}
                    } else {
                      stryCov_9fa48("5375");
                      await this.deleteJobResult(jobId);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("5376")) {
          {}
        } else {
          stryCov_9fa48("5376");
          console.error(stryMutAct_9fa48("5377") ? "" : (stryCov_9fa48("5377"), 'Failed to cleanup filesystem:'), error);
        }
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    if (stryMutAct_9fa48("5378")) {
      {}
    } else {
      stryCov_9fa48("5378");
      this.cleanupInterval = setInterval(() => {
        if (stryMutAct_9fa48("5379")) {
          {}
        } else {
          stryCov_9fa48("5379");
          this.cleanupExpiredEntries().catch(error => {
            if (stryMutAct_9fa48("5380")) {
              {}
            } else {
              stryCov_9fa48("5380");
              console.error(stryMutAct_9fa48("5381") ? "" : (stryCov_9fa48("5381"), 'Cleanup failed:'), error);
            }
          });
        }
      }, stryMutAct_9fa48("5382") ? 60 * 60 / 1000 : (stryCov_9fa48("5382"), (stryMutAct_9fa48("5383") ? 60 / 60 : (stryCov_9fa48("5383"), 60 * 60)) * 1000)); // Run every hour
    }
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval(): void {
    if (stryMutAct_9fa48("5384")) {
      {}
    } else {
      stryCov_9fa48("5384");
      if (stryMutAct_9fa48("5386") ? false : stryMutAct_9fa48("5385") ? true : (stryCov_9fa48("5385", "5386"), this.cleanupInterval)) {
        if (stryMutAct_9fa48("5387")) {
          {}
        } else {
          stryCov_9fa48("5387");
          clearInterval(this.cleanupInterval);
        }
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalJobs: number;
    memoryJobs: number;
    filesystemJobs: number;
    totalSize: number;
  }> {
    if (stryMutAct_9fa48("5388")) {
      {}
    } else {
      stryCov_9fa48("5388");
      const memoryJobs = this.inMemoryStorage.size;
      let filesystemJobs = 0;
      let totalSize = 0;
      try {
        if (stryMutAct_9fa48("5389")) {
          {}
        } else {
          stryCov_9fa48("5389");
          const files = await fs.readdir(this.storageDir);
          filesystemJobs = stryMutAct_9fa48("5390") ? files.length : (stryCov_9fa48("5390"), files.filter(stryMutAct_9fa48("5391") ? () => undefined : (stryCov_9fa48("5391"), file => stryMutAct_9fa48("5392") ? file.startsWith('.json') : (stryCov_9fa48("5392"), file.endsWith(stryMutAct_9fa48("5393") ? "" : (stryCov_9fa48("5393"), '.json'))))).length);

          // Calculate total size
          for (const file of files) {
            if (stryMutAct_9fa48("5394")) {
              {}
            } else {
              stryCov_9fa48("5394");
              if (stryMutAct_9fa48("5397") ? file.startsWith('.json') : stryMutAct_9fa48("5396") ? false : stryMutAct_9fa48("5395") ? true : (stryCov_9fa48("5395", "5396", "5397"), file.endsWith(stryMutAct_9fa48("5398") ? "" : (stryCov_9fa48("5398"), '.json')))) {
                if (stryMutAct_9fa48("5399")) {
                  {}
                } else {
                  stryCov_9fa48("5399");
                  const filePath = join(this.storageDir, file);
                  const stats = await fs.stat(filePath);
                  stryMutAct_9fa48("5400") ? totalSize -= stats.size : (stryCov_9fa48("5400"), totalSize += stats.size);
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("5401")) {
          {}
        } else {
          stryCov_9fa48("5401");
          console.error(stryMutAct_9fa48("5402") ? "" : (stryCov_9fa48("5402"), 'Failed to get filesystem stats:'), error);
        }
      }
      return stryMutAct_9fa48("5403") ? {} : (stryCov_9fa48("5403"), {
        totalJobs: stryMutAct_9fa48("5404") ? memoryJobs - filesystemJobs : (stryCov_9fa48("5404"), memoryJobs + filesystemJobs),
        memoryJobs,
        filesystemJobs,
        totalSize
      });
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    if (stryMutAct_9fa48("5405")) {
      {}
    } else {
      stryCov_9fa48("5405");
      // Clear memory
      this.inMemoryStorage.clear();

      // Clear filesystem
      try {
        if (stryMutAct_9fa48("5406")) {
          {}
        } else {
          stryCov_9fa48("5406");
          const files = await fs.readdir(this.storageDir);
          for (const file of files) {
            if (stryMutAct_9fa48("5407")) {
              {}
            } else {
              stryCov_9fa48("5407");
              if (stryMutAct_9fa48("5410") ? file.startsWith('.json') : stryMutAct_9fa48("5409") ? false : stryMutAct_9fa48("5408") ? true : (stryCov_9fa48("5408", "5409", "5410"), file.endsWith(stryMutAct_9fa48("5411") ? "" : (stryCov_9fa48("5411"), '.json')))) {
                if (stryMutAct_9fa48("5412")) {
                  {}
                } else {
                  stryCov_9fa48("5412");
                  const filePath = join(this.storageDir, file);
                  await fs.unlink(filePath);
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("5413")) {
          {}
        } else {
          stryCov_9fa48("5413");
          console.error(stryMutAct_9fa48("5414") ? "" : (stryCov_9fa48("5414"), 'Failed to clear filesystem:'), error);
        }
      }
    }
  }
}