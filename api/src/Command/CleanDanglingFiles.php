<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanDanglingFiles extends Command
{
    private $pdo;
    private $targetDir;
    private $logger;

    public function __construct(
        string $dsn,
        string $targetDir,
        LoggerInterface $logger
    ) {
        parent::__construct();
        $this->pdo = new \PDO($dsn, null, null);
        $this->logger = $logger;

        $this->targetDir = realpath($targetDir);

        if (!$this->targetDir) {
            throw new \Exception("Target directory (".$this->targetDir.") could not be found !");
        }

        if (!is_writeable($this->targetDir)) {
            throw new \Exception("Target directory (".$this->targetDir.") is not writable !");
        }
    }

    protected function configure()
    {
        $this->setName('zusam:clean-dangling-files')
       ->setDescription('Clean dangling files.')
       ->addOption('only-list', null, InputOption::VALUE_NONE, 'Only list files that would be deleted.')
       ->setHelp('This command deletes files not linked to any message or user.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger->info("zusam:clean-dangling-files");
        // First we get all files not linked to a user and/or a message
        $c = $this->pdo->query("SELECT f.id, f.content_url FROM file f WHERE NOT EXISTS (SELECT * FROM messages_files mf WHERE mf.file_id = f.id) AND NOT EXISTS (SELECT * FROM user u WHERE u.avatar_id = f.id) AND NOT EXISTS (SELECT * FROM link l WHERE l.preview_id = f.id);");
        while($i = $c->fetch()) {
            if ($input->getOption("verbose") || $input->getOption("only-list")) {
                echo $this->targetDir."/".$i["content_url"]."\n";
            }
            if (!$input->getOption("only-list")) {
                $this->pdo->query("DELETE FROM file WHERE id = '" . $i["id"] . "';");
                unlink($this->targetDir."/".$i["content_url"]);
            }
        }

        // We need to get all files without an entry in the database
        foreach(scandir($this->targetDir) as $file) {
            if ($file == "." || $file == ".." || is_dir($file)) {
                continue;
            }
            $id = pathinfo($file, PATHINFO_FILENAME);
            $c = $this->pdo->query("SELECT id, content_url FROM file WHERE id = '" . $id . "';")->fetch();
            // remove the file if not in the database or if the content_url doesn't match the filename
            if (empty($c) || $c["content_url"] != $file) {
                if ($input->getOption("verbose") || $input->getOption("only-list")) {
                    echo $this->targetDir."/$file\n";
                }
                if (!$input->getOption("only-list")) {
                    unlink($this->targetDir."/".$file);
                }
            }
        }
    }
}
