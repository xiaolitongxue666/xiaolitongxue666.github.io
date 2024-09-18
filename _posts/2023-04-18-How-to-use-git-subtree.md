# subtree的用法

[Git 进阶 - 子仓库 subtree](https://www.jianshu.com/p/e9f6ff4e09dc)

[https://gitprotect.io/blog/managing-git-projects-git-subtree-vs-submodule/#:~:text=Git submodules have a smaller,be accessible on the server](https://gitprotect.io/blog/managing-git-projects-git-subtree-vs-submodule/#:~:text=Git%20submodules%20have%20a%20smaller,be%20accessible%20on%20the%20server).

[Git Subtree: Alternative to Git Submodule | Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials/git-subtree)

- 添加子项目

```bash
git subtree add --prefix=subtree_test_first git@github.com:xiaolitongxue666/subtree_test_first.git master --squash
git fetch git@github.com:xiaolitongxue666/subtree_test_first.git master
remote: Enumerating objects: 9, done.
remote: Counting objects: 100% (9/9), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 9 (delta 0), reused 9 (delta 0), pack-reused 0
Unpacking objects: 100% (9/9), 800 bytes | 1024 bytes/s, done.
From github.com:xiaolitongxue666/subtree_test_first
 * branch            master     -> FETCH_HEAD
Added dir 'subtree_test_first'
```

此时主项目目录下,会有一个新的文件夹subtree_test_first,和—prefix=后的值一致,master是分支,--squash是不包含子项目的历史记录

```bash
git status
On branch master
Your branch is ahead of 'origin/master' by 2 commits.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

因为主项目多了一个子项目的文件夹,所以需要push一下,更新主项目的远端

```bash
git push
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (6/6), 753 bytes | 376.00 KiB/s, done.
Total 6 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:xiaolitongxue666/sub_tree_main.git
   7ab85b7..4245f0c  master -> master
```

—prefix指定的名称可以不和子项目的名称一致

添加第二个subtree项目,并在main中重命名文件夹

```bash
git subtree add --prefix=rename_second git@github.com:xiaolitongxue666/subtree_test_second.git master --squash
git fetch git@github.com:xiaolitongxue666/subtree_test_second.git master
remote: Enumerating objects: 9, done.
remote: Counting objects: 100% (9/9), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 9 (delta 0), reused 6 (delta 0), pack-reused 0
Unpacking objects: 100% (9/9), 1.16 KiB | 2.00 KiB/s, done.
From github.com:xiaolitongxue666/subtree_test_second
 * branch            master     -> FETCH_HEAD
Added dir 'rename_second'
```

添加第二个子项目rename_second

- 如果子项目远端更新了,需要同步到本地

```bash
git subtree pull --prefix=subtree_test_first/ git@github.com:xiaolitongxue666/subtree_test_first.git master --squash
remote: Enumerating objects: 12, done.
remote: Counting objects: 100% (12/12), done.
remote: Compressing objects: 100% (9/9), done.
remote: Total 12 (delta 1), reused 11 (delta 0), pack-reused 0
Unpacking objects: 100% (12/12), 1.04 KiB | 3.00 KiB/s, done.
From github.com:xiaolitongxue666/subtree_test_first
 * branch            master     -> FETCH_HEAD
Merge made by the 'ort' strategy.
 subtree_test_first/first.sh | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

- 如果子项目修改的子项目,需要push到子项目的远端

```bash
git subtree push --prefix=rename_second/ git@github.com:xiaolitongxue666/subtree_test_second.git master
git push using:  git@github.com:xiaolitongxue666/subtree_test_second.git master
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 345 bytes | 345.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:xiaolitongxue666/subtree_test_second.git
   08b1c3a..5e820ed  5e820ed52a473cdb96f0a5a6116baa00ed4fae87 -> master
```

- 删除子项目

```bash
git rm -r subtree_test_first/
rm 'subtree_test_first/README.md'
rm 'subtree_test_first/first.sh'

# 重新添加子项目的特定分支
#git subtree add --prefix=<subtree> <repository_url> <subtree_branch>
```

- 上述的所有操作都需要记住远端地址的url,可以通过添加remote的方法来简化操作

```bash
git remote add -f upstream_sub_first git@github.com:xiaolitongxue666/sub_tree_main.git
Updating upstream_sub_first
From github.com:xiaolitongxue666/sub_tree_main
 * [new branch]      master     -> upstream_sub_first/master
```

- 重新用remote name添加子项目

```bash
git subtree add --prefix subtree_test_first/ upstream_sub_first master --squash
git fetch upstream_sub_first master
From github.com:xiaolitongxue666/sub_tree_main
 * branch            master     -> FETCH_HEAD
   ccf37e2..9263ba2  master     -> upstream_sub_first/master
Added dir 'subtree_test_first'
```

- 使用remote name更新子项目

```bash
git fetch upstream_sub_first master
git subtree pull --prefix=subtree_test_first/ upstream_sub_first master --squash
```
